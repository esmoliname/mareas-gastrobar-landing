# Backup ticket del proyecto Mareas Gastrobar.
# Genera un ZIP del código fuente (sin node_modules/.git/dist/backups)
# y un bundle git completo (todas las ramas y tags) en ./backups.
#
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/backup.ps1
# Restaurar bundle:  git clone backups/mareas-git-<fecha>.bundle mareas-restore

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path $outDir "mareas-backup-$stamp.zip"
$bundlePath = Join-Path $outDir "mareas-git-$stamp.bundle"

Write-Host "Creando ZIP del proyecto..." -ForegroundColor Cyan
$items = Get-ChildItem -LiteralPath $root -Force | Where-Object {
  $_.Name -notin @("node_modules", ".git", "dist", "backups")
}
Compress-Archive -Path $items.FullName -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host "Creando bundle git (historial completo)..." -ForegroundColor Cyan
& git -C $root bundle create $bundlePath --all
if ($LASTEXITCODE -ne 0) { throw "Falló git bundle" }

$zip = Get-Item $zipPath
$bundle = Get-Item $bundlePath
Write-Host ""
Write-Host "Backup ticket generado:" -ForegroundColor Green
Write-Host ("  {0}  ({1:N1} MB)" -f $zip.FullName, ($zip.Length / 1MB))
Write-Host ("  {0}  ({1:N1} MB)" -f $bundle.FullName, ($bundle.Length / 1MB))
Write-Host ""
Write-Host "Verificación:"
& git -C $root bundle verify $bundlePath