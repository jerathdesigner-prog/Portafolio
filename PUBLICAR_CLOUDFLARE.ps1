# Compatible con Windows PowerShell 5.1: solo caracteres ASCII en este script.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Fallar([string]$mensaje) {
    Write-Host "ERROR: $mensaje" -ForegroundColor Red
    exit 1
}
function Ejecutar([string]$descripcion, [scriptblock]$comando) {
    Write-Host "`n>>> $descripcion" -ForegroundColor Cyan
    & $comando
    if ($LASTEXITCODE -ne 0) {
        Fallar "No se pudo completar: $descripcion"
    }
}
function Buscar-Base {
    $filas = & npx.cmd wrangler d1 list --json
    if ($LASTEXITCODE -ne 0) { Fallar 'No fue posible consultar las bases D1.' }
    try {
        $lista = ConvertFrom-Json -InputObject ($filas -join "`n")
    } catch {
        Fallar 'Wrangler no devolvio una lista D1 valida. Revisa su mensaje anterior.'
    }
    $coincidencias = @($lista | Where-Object { $_.name -eq 'jerathmoreira-db' })
    if ($coincidencias.Count -gt 0) { return $coincidencias[0] }
    return $null
}

Write-Host 'JERATH MOREIRA - PUBLICACION EN CLOUDFLARE WORKERS' -ForegroundColor Green
Write-Host 'La autorizacion se realiza en el navegador. Nunca compartas tus claves.'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fallar 'Instala Node.js LTS y vuelve a abrir este BAT.' }
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { Fallar 'No se encontro npm. Reinstala Node.js LTS.' }
if (-not (Get-Command npx.cmd -ErrorAction SilentlyContinue)) { Fallar 'No se encontro npx. Reinstala Node.js LTS.' }

Ejecutar 'Instalando dependencias del proyecto' { & npm.cmd install }
Ejecutar 'Autorizando Cloudflare' { & npx.cmd wrangler login }

Write-Host "`n>>> Verificando base de datos D1" -ForegroundColor Cyan
$db = Buscar-Base
if (-not $db) {
    Ejecutar 'Creando base D1 jerathmoreira-db' { & npx.cmd wrangler d1 create jerathmoreira-db --update-config=false }
    $db = Buscar-Base
}
if (-not $db -or -not $db.uuid) { Fallar 'No se encontro el ID de la base D1.' }

$configFile = Join-Path $PSScriptRoot 'wrangler.jsonc'
try {
    $config = Get-Content -LiteralPath $configFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $config.d1_databases[0].database_id = [string]$db.uuid
    $json = $config | ConvertTo-Json -Depth 20
    [System.IO.File]::WriteAllText($configFile, $json, (New-Object System.Text.UTF8Encoding($false)))
} catch {
    Fallar "No se pudo actualizar wrangler.jsonc: $($_.Exception.Message)"
}
Write-Host "Base D1 lista: $($db.name)" -ForegroundColor Green

Write-Host "`n>>> Verificando almacenamiento R2" -ForegroundColor Cyan
# Usar CMD para comprobar la existencia del bucket sin que el error esperado
# detenga Windows PowerShell 5.1 al redirigir stderr.
& cmd.exe /d /c 'npx.cmd wrangler r2 bucket info jerathmoreira-media >NUL 2>&1'
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Si Cloudflare pide activar R2 o facturacion, sigue las instrucciones de su panel.' -ForegroundColor Yellow
    Ejecutar 'Creando bucket R2 jerathmoreira-media' { & npx.cmd wrangler r2 bucket create jerathmoreira-media --update-config=false }
}

Ejecutar 'Publicando web y Dashboard' { & npx.cmd wrangler deploy }

Write-Host "`n>>> Configurando acceso privado al Dashboard" -ForegroundColor Cyan
Write-Host 'Usuario: jerath. Crea una contrasena NUEVA de al menos 12 caracteres.'
$secure = Read-Host 'Contrasena (no se muestra)' -AsSecureString
$pass = (New-Object System.Net.NetworkCredential('', $secure)).Password
if ($pass.Length -lt 12) { $pass = $null; Fallar 'La contrasena debe tener al menos 12 caracteres.' }
try {
    $pass | & npx.cmd wrangler secret put ADMIN_PASSWORD
    if ($LASTEXITCODE -ne 0) { Fallar 'No se pudo guardar ADMIN_PASSWORD.' }
} finally { $pass = $null }

$buf = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($buf) } finally { $rng.Dispose() }
$signKey = [Convert]::ToBase64String($buf)
try {
    $signKey | & npx.cmd wrangler secret put SESSION_SECRET
    if ($LASTEXITCODE -ne 0) { Fallar 'No se pudo guardar SESSION_SECRET.' }
} finally { $signKey = $null }

Write-Host "`nPUBLICACION DE WORKER COMPLETADA" -ForegroundColor Green
Write-Host 'Primero prueba la URL workers.dev que mostro Wrangler.'
Write-Host 'Despues en Cloudflare: Workers & Pages > jerathmoreira-cms > Settings > Domains & Routes > Add > Custom Domain.'
Write-Host 'Dominio: jerathmoreira.com'
Write-Host 'Dashboard: https://jerathmoreira.com/admin (cuando conectes el dominio).'
