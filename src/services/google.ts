import type { GoogleUser, GoogleFile, GoogleAuthResponse } from '../types/google'
import type { SheetItem } from '../types/sheet'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

let accessToken: string | null = null

export async function initGoogleAuth(): Promise<void> {
  await new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

export async function signIn(): Promise<GoogleUser> {
  return new Promise((resolve, reject) => {
    // @ts-ignore - Google API wird dynamisch geladen
    google.accounts.oauth2
      .initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (response: GoogleAuthResponse) => {
          if ('error' in response) {
            reject(new Error((response as any).error))
            return
          }
          accessToken = response.access_token
          const userInfo = await fetchUserInfo()
          resolve(userInfo)
        },
      })
      .requestAccessToken()
  })
}

export async function signOut(): Promise<void> {
  // @ts-ignore - Google API wird dynamisch geladen
  google.accounts.oauth2.revoke(accessToken)
  accessToken = null
}

async function fetchUserInfo(): Promise<GoogleUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return response.json()
}

export async function listExcelFiles(): Promise<GoogleFile[]> {
  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?' +
      new URLSearchParams({
        q: "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id,name,mimeType)',
      }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch files')
  }

  const data = await response.json()
  return data.files
}

export async function readExcelFile(fileId: string): Promise<SheetItem[]> {
  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  // Prüfe, ob es sich um eine Google Sheet handelt
  const fileResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!fileResponse.ok) {
    throw new Error('Failed to fetch file metadata')
  }

  const fileData = await fileResponse.json()
  const isGoogleSheet = fileData.mimeType === 'application/vnd.google-apps.spreadsheet'

  if (isGoogleSheet) {
    // Verwende die Sheets API für Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A:B`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch sheet data')
    }

    const data = await response.json()
    // Überspringe die Header-Zeile
    return data.values.slice(1).map((row: string[]) => ({
      title: row[0] || '',
      imageUrl: row[1] || '',
    }))
  } else {
    // Für Excel-Dateien (.xlsx) verwenden wir die Drive API
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch file content')
    }

    // Hier müssten wir die Excel-Datei parsen
    // Da dies komplex ist, empfehle ich die Verwendung von Google Sheets
    throw new Error('Bitte verwenden Sie Google Sheets statt Excel-Dateien')
  }
}
