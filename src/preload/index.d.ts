import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      loadConfigFile: (relativeFilePathUrl: string, fileName: string, defaultState: unknown) => Promise<string>
      loadConfigDirectory: (relativeDirPathUrl: string) => Promise<string[]>
      saveConfigFile: (relativeFilePathUrl: string, fileName: string, data: string) => Promise<void>
    }
  }
}
