#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


EXCLUDED_DIRS = {".git", ".github", "__pycache__", ".venv", "node_modules"}
TEXT_EXTENSIONS = {
    ".md",
    ".txt",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".xml",
    ".html",
    ".css",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".go",
    ".rb",
    ".php",
    ".cs",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".sh",
    ".ps1",
    ".bat",
}
CODE_EXTENSIONS = {
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".java",
    ".go",
    ".rb",
    ".php",
    ".cs",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
}
MANIFEST_FILES = {
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Pipfile",
    "go.mod",
    "Cargo.toml",
    "pom.xml",
    "build.gradle",
    "Makefile",
}
LINT_HINTS = {"eslint.config.js", ".eslintrc", ".flake8", "ruff.toml", "pylintrc"}
BUILD_HINTS = {"Dockerfile", "docker-compose.yml", "vite.config.ts", "webpack.config.js"}
SNAPSHOT_HINTS = (
    "saved_resource",
    "alternategtm",
    "RotateCookiesPage",
    "proxy",
    "cb=gapi",
    "m=",
    "rs=",
    ".descargar",
)
MAX_SCAN_FILE_SIZE = 2 * 1024 * 1024

SECRET_PATTERNS = [
    ("high", "Google API key style token", re.compile(r"AIza[0-9A-Za-z\-_]{35}")),
    (
        "high",
        "Private key marker",
        re.compile(r"-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----"),
    ),
    (
        "medium",
        "Hardcoded password/token assignment",
        re.compile(
            r"(?i)\b(password|passwd|secret|token|api[_-]?key)\b\s*[:=]\s*['\"][^'\"]{6,}['\"]"
        ),
    ),
    (
        "medium",
        "Email/PII-like value",
        re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    ),
]


@dataclass
class Finding:
    severity: str
    title: str
    details: str
    recommendation: str
    evidence: list[str]


def is_excluded(path: Path, root: Path) -> bool:
    rel_parts = path.relative_to(root).parts
    return any(part in EXCLUDED_DIRS for part in rel_parts)


def iter_files(root: Path) -> Iterable[Path]:
    for candidate in root.rglob("*"):
        if candidate.is_file() and not is_excluded(candidate, root):
            yield candidate


def is_probably_text(path: Path) -> bool:
    if path.suffix.lower() in TEXT_EXTENSIONS:
        return True
    try:
        sample = path.read_bytes()[:2048]
    except OSError:
        return False
    if b"\x00" in sample:
        return False
    return True


def scan_sensitive_matches(root: Path, files: list[Path]) -> tuple[list[dict], list[Finding]]:
    matches: list[dict] = []
    findings: list[Finding] = []
    hits_by_kind: dict[str, list[str]] = {}
    max_matches = 120

    for file_path in files:
        if not is_probably_text(file_path):
            continue
        try:
            if file_path.stat().st_size > MAX_SCAN_FILE_SIZE:
                continue
            content = file_path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue

        rel = str(file_path.relative_to(root))
        for line_no, line in enumerate(content.splitlines(), start=1):
            for severity, title, pattern in SECRET_PATTERNS:
                if len(matches) >= max_matches:
                    break
                if pattern.search(line):
                    snippet = line.strip()
                    if len(snippet) > 140:
                        snippet = snippet[:140] + "..."
                    hit = {
                        "severity": severity,
                        "type": title,
                        "file": rel,
                        "line": line_no,
                        "snippet": snippet,
                    }
                    matches.append(hit)
                    hits_by_kind.setdefault(title, []).append(f"{rel}:{line_no}")
            if len(matches) >= max_matches:
                break

    for title, evidence in hits_by_kind.items():
        severity = "high" if any(m["type"] == title and m["severity"] == "high" for m in matches) else "medium"
        findings.append(
            Finding(
                severity=severity,
                title=f"Sensitive-pattern matches: {title}",
                details=f"Se detectaron {len(evidence)} coincidencias de patrón sensible.",
                recommendation="Revisa, elimina datos reales y usa variables de entorno/archivos de ejemplo.",
                evidence=evidence[:8],
            )
        )

    return matches, findings


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def build_report(root: Path) -> dict:
    files = list(iter_files(root))
    total_files = len(files)
    total_size_bytes = sum(file.stat().st_size for file in files if file.exists())
    code_files = [f for f in files if f.suffix.lower() in CODE_EXTENSIONS]
    html_files = [f for f in files if f.suffix.lower() == ".html"]
    snapshot_files = [
        f for f in files if any(marker.lower() in f.name.lower() for marker in SNAPSHOT_HINTS)
    ]
    manifests = [name for name in MANIFEST_FILES if (root / name).exists()]
    lint_hints = [name for name in LINT_HINTS if (root / name).exists()]
    build_hints = [name for name in BUILD_HINTS if (root / name).exists()]
    has_ci = any((root / ".github" / "workflows").glob("*.yml")) or any(
        (root / ".github" / "workflows").glob("*.yaml")
    )
    has_src_dir = any((root / d).exists() for d in ("src", "app", "lib", "server", "client"))
    has_readme = (root / "README.md").exists() or (root / "readme.md").exists()
    tests = [
        f
        for f in files
        if re.search(r"(?i)(test|spec)", f.name) and f.suffix.lower() in TEXT_EXTENSIONS
    ]

    sensitive_matches, sensitive_findings = scan_sensitive_matches(root, files)

    findings: list[Finding] = []

    structure_score = 0.0
    if manifests:
        structure_score += 1.1
    else:
        findings.append(
            Finding(
                severity="high",
                title="Sin manifiesto de dependencias",
                details="No se encontró package.json/pyproject/go.mod/etc.",
                recommendation="Define el stack y agrega el manifiesto principal del proyecto.",
                evidence=[],
            )
        )
    structure_score += 0.8 if has_src_dir else 0.1
    if not has_src_dir:
        findings.append(
            Finding(
                severity="medium",
                title="Sin estructura de código estándar",
                details="No hay carpeta src/app/lib/server/client.",
                recommendation="Crea una estructura base (por ejemplo src/, scripts/, tests/).",
                evidence=[],
            )
        )
    structure_score += 0.3 if has_readme else 0.0
    structure_score += 0.3 if len(code_files) >= 3 else 0.0
    structure_score = clamp(structure_score, 0.0, 2.5)

    automation_score = 0.0
    automation_score += 1.2 if has_ci else 0.0
    automation_score += 0.8 if tests else 0.0
    automation_score += 0.3 if lint_hints else 0.0
    automation_score += 0.2 if build_hints else 0.0
    if not has_ci:
        findings.append(
            Finding(
                severity="high",
                title="Sin CI/CD",
                details="No hay workflows de GitHub Actions.",
                recommendation="Agrega pipeline de auditoría, pruebas y build en cada PR.",
                evidence=[],
            )
        )
    if not tests:
        findings.append(
            Finding(
                severity="medium",
                title="Sin pruebas automáticas",
                details="No se detectaron archivos de pruebas.",
                recommendation="Agrega pruebas mínimas smoke/integración para evitar regresiones.",
                evidence=[],
            )
        )
    automation_score = clamp(automation_score, 0.0, 2.5)

    snapshot_ratio = (len(snapshot_files) / total_files) if total_files else 0
    quality_score = 0.0
    quality_score += 1.0 if len(code_files) >= 10 else 0.6 if len(code_files) >= 3 else 0.2
    quality_score += 0.9 if snapshot_ratio < 0.1 else 0.5 if snapshot_ratio < 0.3 else 0.1
    quality_score += 0.6 if len(html_files) <= 3 else 0.3
    quality_score = clamp(quality_score, 0.0, 2.5)

    if snapshot_ratio >= 0.3:
        findings.append(
            Finding(
                severity="high",
                title="Repositorio dominado por snapshots/exportaciones",
                details="Hay múltiples archivos descargados de terceros (Google/Firebase) en vez de código fuente modular.",
                recommendation="Separar snapshots en archive/ y reconstruir la app en src/.",
                evidence=[str(f.relative_to(root)) for f in snapshot_files[:8]],
            )
        )

    security_score = 2.5
    high_hits = sum(1 for match in sensitive_matches if match["severity"] == "high")
    medium_hits = sum(1 for match in sensitive_matches if match["severity"] == "medium")
    if high_hits:
        security_score -= 1.2
    if medium_hits:
        security_score -= 0.8
    if snapshot_ratio >= 0.3:
        security_score -= 0.3
    security_score = clamp(security_score, 0.0, 2.5)
    findings.extend(sensitive_findings)

    overall = round(structure_score + automation_score + quality_score + security_score, 1)

    opportunities = []
    if not manifests:
        opportunities.append("Definir stack y crear manifiesto (package.json o pyproject.toml).")
    if not has_ci:
        opportunities.append("Agregar GitHub Actions para auditoría + pruebas en push y PR.")
    if not tests:
        opportunities.append("Agregar pruebas smoke para validar que el proyecto abre/procesa correctamente.")
    if snapshot_ratio >= 0.3:
        opportunities.append(
            "Automatizar limpieza: mover snapshots a archive/raw_snapshot y dejar raíz solo con código productivo."
        )
    opportunities.append("Configurar quality gate con score mínimo en CI (ejemplo: 6.5/10).")

    return {
        "project_root": str(root),
        "totals": {
            "files": total_files,
            "size_bytes": total_size_bytes,
            "size_mb": round(total_size_bytes / (1024 * 1024), 2),
            "code_files": len(code_files),
            "html_files": len(html_files),
            "snapshot_like_files": len(snapshot_files),
            "tests_detected": len(tests),
        },
        "score": {
            "overall_1_to_10": overall,
            "breakdown": {
                "structure_0_to_2_5": round(structure_score, 2),
                "automation_0_to_2_5": round(automation_score, 2),
                "quality_0_to_2_5": round(quality_score, 2),
                "security_0_to_2_5": round(security_score, 2),
            },
        },
        "signals": {
            "dependency_manifests": manifests,
            "lint_hints": lint_hints,
            "build_hints": build_hints,
            "has_ci_workflow": has_ci,
            "has_source_directory": has_src_dir,
            "has_readme": has_readme,
        },
        "findings": [asdict(item) for item in findings],
        "sensitive_matches_preview": sensitive_matches[:25],
        "automation_opportunities": opportunities,
    }


def print_human_report(report: dict) -> None:
    print("=== ProyectoMami Audit ===")
    print(f"Ruta: {report['project_root']}")
    print(
        f"Score: {report['score']['overall_1_to_10']}/10 "
        f"(Estructura {report['score']['breakdown']['structure_0_to_2_5']}, "
        f"Automatización {report['score']['breakdown']['automation_0_to_2_5']}, "
        f"Calidad {report['score']['breakdown']['quality_0_to_2_5']}, "
        f"Seguridad {report['score']['breakdown']['security_0_to_2_5']})"
    )
    print(
        "Totales: "
        f"{report['totals']['files']} archivos, "
        f"{report['totals']['size_mb']} MB, "
        f"{report['totals']['code_files']} de código."
    )

    findings = report.get("findings", [])
    if findings:
        print("\nPrincipales hallazgos:")
        for item in findings[:6]:
            print(f"- [{item['severity'].upper()}] {item['title']} - {item['details']}")
    else:
        print("\nNo se detectaron hallazgos críticos.")

    print("\nOportunidades de automatización:")
    for item in report.get("automation_opportunities", [])[:6]:
        print(f"- {item}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Auditoría de eficiencia y automatización del proyecto.")
    parser.add_argument("--path", default=".", help="Ruta raíz del proyecto a auditar.")
    parser.add_argument(
        "--json-output",
        default="audit-report.json",
        help="Ruta del reporte JSON de salida.",
    )
    parser.add_argument(
        "--min-score",
        type=float,
        default=None,
        help="Si se define, falla (exit 2) cuando el score global es menor al umbral.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.path).resolve()
    report = build_report(root)

    out_path = Path(args.json_output)
    if not out_path.is_absolute():
        out_path = root / out_path
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print_human_report(report)
    print(f"\nReporte JSON: {out_path}")

    if args.min_score is not None and report["score"]["overall_1_to_10"] < args.min_score:
        print(
            f"\nFallo de calidad: score {report['score']['overall_1_to_10']} < mínimo {args.min_score}."
        )
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
