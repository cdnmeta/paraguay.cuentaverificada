import React from 'react'
import { cn } from '@/lib/utils' // Ajusta la ruta si es necesario

export default function NoImage({ className = '' }) {
    return (
        <img
            src="/sin-imagen.png"
            className={cn('w-full h-48 object-cover rounded-xl', className)}
            alt="Sin imagen"
        />
    )
}
