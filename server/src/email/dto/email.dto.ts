export class BaseEmailDto {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    
}


export class RecoveryPinEmail extends BaseEmailDto {
    url:string
}

export class VerificacionSolicitudCuentaEmail extends BaseEmailDto {
    codigo_verificacion: string
}

export class NotificacionSolicitudVerificacionCuentaEmail extends BaseEmailDto {
    nombre_usuario: string
    email_usuario: string
}