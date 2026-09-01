param (
    [Parameter(Mandatory=$true)]
    [string]$GithubToken,

    [Parameter(Mandatory=$true)]
    [string]$GithubUsername,

    [Parameter(Mandatory=$true)]
    [string]$RepoName
)

$ErrorActionPreference = "Stop"
$Headers = @{
    "Authorization" = "token $GithubToken"
    "Accept"        = "application/vnd.github.v3+json"
}

$BaseUrl = "https://api.github.com"

Write-Host "Comprobando si el repositorio existe..."
$RepoUrl = "$BaseUrl/repos/$GithubUsername/$RepoName"
try {
    $RepoInfo = Invoke-RestMethod -Uri $RepoUrl -Headers $Headers -Method Get
    Write-Host "El repositorio ya existe."
} catch {
    Write-Host "Creando el repositorio $RepoName..."
    $Body = @{
        name = $RepoName
        private = $true
        auto_init = $true # Inicializa con un README y la rama main
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$BaseUrl/user/repos" -Headers $Headers -Method Post -Body $Body
    Start-Sleep -Seconds 3 # Esperar a que GitHub asiente la inicialización
}

# Obtener la referencia de la rama main
Write-Host "Obteniendo la referencia de la rama main..."
$RefUrl = "$RepoUrl/git/refs/heads/main"
$RefInfo = Invoke-RestMethod -Uri $RefUrl -Headers $Headers -Method Get
$LatestCommitSha = $RefInfo.object.sha

# Obtener el commit actual para sacar su árbol
$CommitInfoUrl = "$RepoUrl/git/commits/$LatestCommitSha"
$CommitInfo = Invoke-RestMethod -Uri $CommitInfoUrl -Headers $Headers -Method Get
$BaseTreeSha = $CommitInfo.tree.sha

Write-Host "Recolectando archivos para subir..."
$ExcludedFolders = @('node_modules', '.git', 'dist', 'graphify-out', '.obsidian')
$Files = Get-ChildItem -Path . -File -Recurse | Where-Object {
    $Skip = $false
    foreach ($Folder in $ExcludedFolders) {
        if ($_.FullName -match "\\$Folder\\") {
            $Skip = $true
            break
        }
    }
    -not $Skip
}

$TreeItems = @()

foreach ($File in $Files) {
    # Convertimos a ruta relativa estilo UNIX
    $RelativePath = Resolve-Path -Relative $File.FullName
    $RelativePath = $RelativePath -replace '^.\\', '' -replace '\\', '/'
    
    Write-Host " -> Procesando $RelativePath"
    
    # Leemos el archivo como bytes y lo codificamos en Base64 para evitar problemas con binarios
    $Bytes = [System.IO.File]::ReadAllBytes($File.FullName)
    $Base64 = [Convert]::ToBase64String($Bytes)
    
    # Crear Blob en GitHub
    $BlobBody = @{
        content  = $Base64
        encoding = "base64"
    } | ConvertTo-Json
    
    $BlobResponse = Invoke-RestMethod -Uri "$RepoUrl/git/blobs" -Headers $Headers -Method Post -Body $BlobBody
    
    $TreeItems += @{
        path = $RelativePath
        mode = "100644"
        type = "blob"
        sha  = $BlobResponse.sha
    }
}

Write-Host "Creando el nuevo árbol de archivos..."
$TreeBody = @{
    base_tree = $BaseTreeSha
    tree      = $TreeItems
} | ConvertTo-Json -Depth 10

$TreeResponse = Invoke-RestMethod -Uri "$RepoUrl/git/trees" -Headers $Headers -Method Post -Body $TreeBody

Write-Host "Creando el commit..."
$CommitBody = @{
    message = "Despliegue automatizado via API REST"
    tree    = $TreeResponse.sha
    parents = @($LatestCommitSha)
} | ConvertTo-Json

$NewCommitResponse = Invoke-RestMethod -Uri "$RepoUrl/git/commits" -Headers $Headers -Method Post -Body $CommitBody

Write-Host "Actualizando la rama main..."
$RefBody = @{
    sha   = $NewCommitResponse.sha
    force = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri $RefUrl -Headers $Headers -Method Patch -Body $RefBody

Write-Host "========================================="
Write-Host "¡Subida a GitHub completada exitosamente!"
Write-Host "========================================="
Write-Host "Ahora puedes conectar el repositorio a Vercel desde el panel web de Vercel."
