#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
from dataclasses import dataclass
from pathlib import Path


SNAPSHOT_MARKERS = (
    "saved_resource",
    "alternategtm",
    "RotateCookiesPage",
    "proxy",
    "cb=gapi",
    "m=",
    "rs=",
    ".descargar",
)

SNAPSHOT_EXTENSIONS = {".descargar"}
KEEP_ROOT_FILES = {"README.md"}


@dataclass
class MoveAction:
    src: Path
    dst: Path
    reason: str


def classify(file_path: Path) -> str | None:
    name = file_path.name
    lower_name = name.lower()
    if any(marker.lower() in lower_name for marker in SNAPSHOT_MARKERS):
        return "snapshot-marker"
    if file_path.suffix.lower() in SNAPSHOT_EXTENSIONS:
        return "snapshot-extension"
    return None


def collect_actions(root: Path) -> list[MoveAction]:
    archive_dir = root / "archive" / "raw_snapshot"
    actions: list[MoveAction] = []

    for entry in root.iterdir():
        if not entry.is_file():
            continue
        if entry.name in KEEP_ROOT_FILES:
            continue
        reason = classify(entry)
        if reason:
            destination = archive_dir / entry.name
            actions.append(MoveAction(src=entry, dst=destination, reason=reason))

    return actions


def ensure_dirs(actions: list[MoveAction]) -> None:
    for action in actions:
        action.dst.parent.mkdir(parents=True, exist_ok=True)


def run_actions(actions: list[MoveAction], apply: bool) -> list[dict]:
    results = []
    for action in actions:
        result = {
            "source": str(action.src),
            "destination": str(action.dst),
            "reason": action.reason,
            "status": "planned",
        }
        if apply:
            shutil.move(str(action.src), str(action.dst))
            result["status"] = "moved"
        results.append(result)
    return results


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Limpieza segura de archivos snapshot.")
    parser.add_argument("--path", default=".", help="Ruta raíz del proyecto.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Aplica movimientos reales. Sin este flag, solo dry-run.",
    )
    parser.add_argument(
        "--json-output",
        default="cleanup-report.json",
        help="Ruta del reporte JSON.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.path).resolve()
    actions = collect_actions(root)

    if args.apply:
        ensure_dirs(actions)
    results = run_actions(actions, apply=args.apply)

    report = {
        "root": str(root),
        "mode": "apply" if args.apply else "dry-run",
        "planned_moves": len(actions),
        "results": results,
        "next": "Revisa el reporte y ejecuta con --apply para confirmar los cambios."
        if not args.apply
        else "Limpieza aplicada. Ejecuta la auditoría para medir impacto.",
    }

    out_path = Path(args.json_output)
    if not out_path.is_absolute():
        out_path = root / out_path
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Modo: {report['mode']}")
    print(f"Movimientos planificados: {report['planned_moves']}")
    for item in results[:20]:
        print(f"- {item['status']}: {item['source']} -> {item['destination']} ({item['reason']})")
    if len(results) > 20:
        print(f"... y {len(results) - 20} más")
    print(f"Reporte: {out_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
