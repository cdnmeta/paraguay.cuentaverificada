import { Card } from '@/components/ui/card'
import React from 'react'
import FormFacturaPlanes from '../components/FormFacturaPlanes'

export default function FacturaPlanesPage() {
  return (
    <Card className={"max-h-full p-4"}>
        <h1>Factura de Planes</h1>
        <FormFacturaPlanes />
    </Card>
  )
}
