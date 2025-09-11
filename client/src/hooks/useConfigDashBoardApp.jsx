import React, { useState } from 'react'

export default function useConfigDashBoardApp() {
    const [urlDashBoardApp, setUrlDashBoardApp] = useState("/panel")
  return {urlDashBoardApp,setUrlDashBoardApp}
}
