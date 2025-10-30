import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  TrendingUp,
  ArrowDownLeft,
  TrendingDown,
  CreditCard,
  Banknote,
  Eye,
  AlertCircle,
  Edit,
  Trash2,
  Receipt,
  MoreVertical,
  Calculator,
  Calendar,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  eliminarMovimientoSemaforo,
  eliminarAbono,
} from "@/apis/semaforoFinanciero.api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FormSemaforoFinancieroMovimiento from './FormSemaforoFinancieroMovimiento';
import FormAbonoMovimiento from './FormAbonoMovimiento';
import { convertirMoneda } from "@/utils/funciones";
import { TIPOS_MOVIMIENTOS } from "../utils/constanst";
import SemaforoImg from "./SemaforoImg";

const ConteoMovimientos = ({ data = {}, cotizaciones = [], afterDelete = () => {} }) => {
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoSemaforo, setTipoSemaforo] = useState('default');
  const [abonosDialog, setAbonosDialog] = useState({
    open: false,
    movimiento: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    movimientoId: null,
    titulo: "",
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    movimientoId: null,
    titulo: "",
  });
  const [abonoDialog, setAbonoDialog] = useState({
    open: false,
    movimiento: null,
  });
  const [formDialog, setFormDialog] = useState({
      open: false,
      tipoMovimiento: null,
      titulo: "",
    });
  

  const [porcentajeMostrar, setPorcentajeMostrar] = useState(0);

  const [deleteAbonoDialog, setDeleteAbonoDialog] = useState({
    open: false,
    abonoId: null,
    abonoMonto: "",
    movimientoId: null,
  });

  // useEffect para actualizar el porcentaje cuando cambien los datos
  useEffect(() => {
    if (data.saldos && data.saldos.length > 0) {
      const saldos = data.saldos || [];
      let totalIngresos = 0;
      let totalGastos = 0;

      saldos.forEach((saldo) => {
        // Convertir ingresos a guaraníes
        let ingresosEnGuaranies = 0;
        if (saldo.id_moneda === 2) {
          ingresosEnGuaranies = saldo.ingresos || 0;
        } else if (saldo.id_moneda === 1 && cotizaciones.length > 0) {
          try {
            const conversion = convertirMoneda(cotizaciones, saldo.ingresos || 0, 1, 2);
            ingresosEnGuaranies = conversion.venta;
          } catch {
            ingresosEnGuaranies = (saldo.ingresos || 0) * 7200;
          }
        }

        // Convertir gastos a guaraníes
        let gastosEnGuaranies = 0;
        if (saldo.id_moneda === 2) {
          gastosEnGuaranies = saldo.egresos || 0;
        } else if (saldo.id_moneda === 1 && cotizaciones.length > 0) {
          try {
            const conversion = convertirMoneda(cotizaciones, saldo.egresos || 0, 1, 2);
            gastosEnGuaranies = conversion.venta;
          } catch {
            gastosEnGuaranies = (saldo.egresos || 0) * 7200;
          }
        }

        totalIngresos += ingresosEnGuaranies;
        totalGastos += gastosEnGuaranies;
      });

      const porcentajeGanancia = totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0;

      // Lógica del semáforo financiero
      if (totalGastos > totalIngresos) {
        // ROJO: Perdida cuando gastos superiores a ingresos
        setTipoSemaforo('rojo');
      } else if (porcentajeGanancia >= -5 && porcentajeGanancia <= 5) {
        // AMARILLO: Margen del 5% hacia arriba o hacia abajo
        setTipoSemaforo('amarillo');
      } else if (totalIngresos > totalGastos && porcentajeGanancia > 5) {
        // VERDE: Ingresos superiores a gastos con margen mayor al 5%
        setTipoSemaforo('verde');
      } else {
        // Caso por defecto
        setTipoSemaforo('amarillo');
      }

      setPorcentajeMostrar(porcentajeGanancia);
    }
  }, [data.saldos, cotizaciones]);

  const getTipoMovimientoConfig = (tipo) => {
    const configs = {
      1: {
        label: "Ingreso Fijo",
        icon: ArrowUpRight,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      2: {
        label: "Ingreso Extra",
        icon: TrendingUp,
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      3: {
        label: "Gasto Fijo",
        icon: ArrowDownLeft,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
      4: {
        label: "Gasto Extra",
        icon: TrendingDown,
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
      5: {
        label: "Cuentas por Pagar",
        icon: CreditCard,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      },
      6: {
        label: "Cuentas por Cobrar",
        icon: Banknote,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      },
    };
    return (
      configs[tipo] || {
        label: "Desconocido",
        icon: AlertCircle,
        color: "text-gray-600",
      }
    );
  };

  // Función para convertir un monto a guaraníes
  const convertirAGuaranies = (monto, idMoneda) => {
    if (idMoneda === 2) return monto; // Ya está en guaraníes
    if (idMoneda === 1 && cotizaciones.length > 0) {
      try {
        const conversion = convertirMoneda(cotizaciones, monto, 1, 2);
        return conversion.venta; // Usamos el precio de venta para conversión
      } catch (error) {
        console.warn("Error en conversión de moneda:", error);
        return monto * 7200; // Fallback con tasa por defecto
      }
    }
    return monto * 7200; // Fallback para otros casos
  };

  // Función para calcular totales por tipo de movimiento con la nueva estructura
  const calcularTotalesPorTipo = () => {
    if (!data.movimientos) return {
      ingresoFijo: 0,
      ingresoOcasional: 0,
      gastoFijo: 0,
      gastoOcasional: 0,
      egresosPorPagar: 0,
      ingresosPorCobrar: 0,
      ingresosSaldosCobrar: 0,
      egresosSaldosPagar: 0,
    };

    const totales = {
      ingresoFijo: 0,
      ingresoOcasional: 0,
      gastoFijo: 0,
      gastoOcasional: 0,
      egresosPorPagar: 0,
      ingresosPorCobrar: 0,
      ingresosSaldosCobrar: 0,
      egresosSaldosPagar: 0,
    };

    // Calcular ingresos fijos
    (data.movimientos.ingresos_fijos || []).forEach((mov) => {
      totales.ingresoFijo += convertirAGuaranies(mov.monto, mov.id_moneda);
    });

    // Calcular ingresos ocasionales
    (data.movimientos.ingresos_ocasionales || []).forEach((mov) => {
      totales.ingresoOcasional += convertirAGuaranies(mov.monto, mov.id_moneda);
    });

    // Calcular gastos fijos
    (data.movimientos.egresos_fijos || []).forEach((mov) => {
      totales.gastoFijo += convertirAGuaranies(mov.monto, mov.id_moneda);
    });

    // Calcular gastos ocasionales
    (data.movimientos.egresos_ocasionales || []).forEach((mov) => {
      totales.gastoOcasional += convertirAGuaranies(mov.monto, mov.id_moneda);
    });

    // Calcular egresos por pagar
    (data.movimientos.por_pagar || []).forEach((mov) => {
      totales.egresosPorPagar += convertirAGuaranies(mov.monto, mov.id_moneda);
      totales.egresosSaldosPagar += convertirAGuaranies(mov.saldo || 0, mov.id_moneda);
    });

    // Calcular ingresos por cobrar
    (data.movimientos.por_cobrar || []).forEach((mov) => {
      totales.ingresosPorCobrar += convertirAGuaranies(mov.monto, mov.id_moneda);
      totales.ingresosSaldosCobrar += convertirAGuaranies(mov.saldo || 0, mov.id_moneda);
    });

    return totales;
  };

  // Función para calcular resúmenes de ingresos y gastos usando saldos
  const calcularResumenes = () => {
    const totales = calcularTotalesPorTipo();
    const saldos = data.saldos || [];

    // Procesar datos de saldos y convertir todo a guaraníes
    let totalIngresos = 0;
    let totalGastos = 0;
    let saldoTotal = 0;

    saldos.forEach((saldo) => {
      // Convertir ingresos a guaraníes
      let ingresosEnGuaranies = 0;
      if (saldo.id_moneda === 2) {
        // Ya está en guaraníes
        ingresosEnGuaranies = saldo.ingresos || 0;
      } else if (saldo.id_moneda === 1) {
        // Convertir de USD a PYG
        ingresosEnGuaranies = convertirAGuaranies(saldo.ingresos || 0, 1);
      }

      // Convertir gastos a guaraníes
      let gastosEnGuaranies = 0;
      if (saldo.id_moneda === 2) {
        // Ya está en guaraníes
        gastosEnGuaranies = saldo.egresos || 0;
      } else if (saldo.id_moneda === 1) {
        // Convertir de USD a PYG
        gastosEnGuaranies = convertirAGuaranies(saldo.egresos || 0, 1);
      }

      // Convertir saldo a guaraníes
      let saldoEnGuaranies = 0;
      if (saldo.id_moneda === 2) {
        // Ya está en guaraníes
        saldoEnGuaranies = saldo.saldo || 0;
      } else if (saldo.id_moneda === 1) {
        // Convertir de USD a PYG
        saldoEnGuaranies = convertirAGuaranies(saldo.saldo || 0, 1);
      }

      totalIngresos += ingresosEnGuaranies;
      totalGastos += gastosEnGuaranies;
      saldoTotal += saldoEnGuaranies;
    });

    // Calcular porcentaje de ganancia fuera del bucle
    const porcentajeGanancia = totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0;

    // La ganancia total es el saldo total calculado
    const gananciaTotal = saldoTotal;
    
    // Calcular promedios diarios usando el campo 'diario' de los saldos
    let promedioDiarioGanancia = 0;
    saldos.forEach((saldo) => {
      if (saldo.id_moneda === 2) {
        // Ya está en guaraníes
        promedioDiarioGanancia += saldo.diario || 0;
      } else if (saldo.id_moneda === 1) {
        // Convertir de USD a PYG
        promedioDiarioGanancia += convertirAGuaranies(saldo.diario || 0, 1);
      }
    });

    const promedioDiarioIngresos = totalIngresos / 30;
    const promedioDiarioGastos = totalGastos / 30;
    
    // Los valores mensuales son los totales calculados
    const promedioMensualIngresos = totalIngresos;
    const promedioMensualGastos = totalGastos;
    const promedioMensualGanancia = gananciaTotal;

    return {
      promedioDiario: {
        ingresos: promedioDiarioIngresos,
        gastos: promedioDiarioGastos,
        ganancia: promedioDiarioGanancia,
      },
      promedioMensual: {
        ingresos: promedioMensualIngresos,
        gastos: promedioMensualGastos,
        ganancia: promedioMensualGanancia,
      },
      totales,
      saldoTotal,
      saldos, // Incluir los saldos originales para mostrar detalles por moneda si es necesario
      porcentajeGanancia, // Agregar el porcentaje de ganancia
    };
  };

  const formatMoney = (amount, moneda = "USD") => {
    if (amount === null || amount === undefined || isNaN(amount)) return "0";

    const formatter = new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-PY");
  };

  // Funciones para mapear IDs a descripciones
  const getMonedaDescripcion = (idMoneda) => {
    const monedas = {
      1: "USD",
      2: "PYG"
    };
    return monedas[idMoneda] || "Desconocida";
  };

  const getEstadoDescripcion = (idEstado) => {
    const estados = {
      1: "Pendiente",
      2: "Pagado", 
      3: "Cobrado",
      4: "Vencido"
    };
    return estados[idEstado] || "Desconocido";
  };

  const calcularTotalGS = (abonos) => {
    if (!Array.isArray(abonos)) return 0;
    return abonos.reduce((total, abono) => {
      const montoEnGS = convertirAGuaranies(abono.monto_abono, abono.id_moneda);
      return total + montoEnGS;
    }, 0);
  };



  const handleCardClick = (tipo) => {
    const movimientosDelTipo = obtenerMovimientosPorTipo(tipo);
    setSelectedTipo({
      tipo,
      movimientos: movimientosDelTipo,
      config: getTipoMovimientoConfig(tipo),
    });
    setDialogOpen(true);
  };

  // Funciones para manejar movimientos
  const handleEditMovimiento = (id, titulo = "") => {
    setEditDialog({ open: true, movimientoId: id, titulo });
  };

  const handleDeleteMovimiento = (id, titulo = "") => {
    setDeleteDialog({ open: true, movimientoId: id, titulo });
  };

  const cerrarEditDialog = () => {
    setEditDialog({ open: false, movimientoId: null, titulo: "" });
  };

  const onEditSuccess = () => {
    cerrarEditDialog();
    afterDelete?.(); // Recarga los datos
    toast.success("Movimiento actualizado exitosamente");
  };

  const confirmarEliminarMovimiento = async () => {
    if (!deleteDialog.movimientoId) return;

    try {
      await eliminarMovimientoSemaforo(deleteDialog.movimientoId);
      toast.success("Movimiento eliminado exitosamente");
      // Recargar datos después de eliminar
    afterDelete?.();
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      toast.error("Error al eliminar el movimiento");
    } finally {
      setDeleteDialog({ open: false, movimientoId: null, titulo: "" });
    }
  };

  const handleVerAbonos = (movimiento) => {
    setAbonosDialog({ open: true, movimiento });
  };

  const handleRegistrarAbono = (movimiento) => {
    setAbonoDialog({ open: true, movimiento });
  };

  const cerrarAbonoDialog = () => {
    setAbonoDialog({ open: false, movimiento: null });
  };

  const handleDeleteAbono = (abonoId, abonoMonto, movimientoId) => {
    setDeleteAbonoDialog({ 
      open: true, 
      abonoId, 
      abonoMonto: formatMoney(abonoMonto, "PYG"), 
      movimientoId 
    });
  };

  const confirmarEliminarAbono = async () => {
    try {
      await eliminarAbono(deleteAbonoDialog.abonoId);
      toast.success("Abono eliminado exitosamente");
      
      // Recargar datos después de eliminar el abono
      afterDelete();
      
      // Cerrar el dialog
      setDeleteAbonoDialog({ open: false, abonoId: null, abonoMonto: "", movimientoId: null });
      
      // Si estamos en el dialog de abonos, también cerrarlo para refrescar
      setAbonosDialog({ open: false, movimiento: null });
      
    } catch (error) {
      console.error("Error al eliminar abono:", error);
      toast.error("Error al eliminar el abono");
    }
  };

  const onAbonoSuccess = () => {
    cerrarAbonoDialog();
    afterDelete?.(); // Recarga los datos
    toast.success("Abono registrado exitosamente");
  };

  if (!data) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  const egresos = [
    { tipo: 3, count: data?.conteos?.cant_egreso_fijo || 0 },
    { tipo: 4, count: data?.conteos?.cant_egreso_ocasional || 0 },
    { tipo: 5, count: data?.conteos?.cant_egresos_por_pagar || 0 },
    
  ];

  const ingresos = [
    { tipo: 1, count: data?.conteos?.cant_ingreso_fijo || 0 },
    { tipo: 2, count: data?.conteos?.cant_ingreso_ocasional || 0 },
    { tipo: 6, count: data?.conteos?.cant_ingresos_por_cobrar || 0 },
  ]

  // Para el dialog, mostrar todos los movimientos del tipo según la nueva estructura
  const obtenerMovimientosPorTipo = (tipo) => {
    if (!data.movimientos) return [];
    
    switch (tipo) {
      case 1: // Ingreso Fijo
        return data.movimientos.ingresos_fijos || [];
      case 2: // Ingreso Ocasional
        return data.movimientos.ingresos_ocasionales || [];
      case 3: // Gasto Fijo
        return data.movimientos.egresos_fijos || [];
      case 4: // Gasto Ocasional
        return data.movimientos.egresos_ocasionales || [];
      case 5: // Egresos por Pagar
        return data.movimientos.por_pagar || [];
      case 6: // Ingresos por Cobrar
        return data.movimientos.por_cobrar || [];
      default:
        return [];
    }
  };

  const abrirFormularioMovimiento = (tipoMovimiento, titulo) => {
    setFormDialog({ open: true, tipoMovimiento, titulo });
  };

  const cerrarFormularioMovimiento = () => {
    setFormDialog({ open: false, tipoMovimiento: null, titulo: "" });
  };

  const onFormularioSuccess = () => {
    cerrarFormularioMovimiento();
    afterDelete?.(); // Recarga los datos
  };

  // Calcular resúmenes
  const resumenes = calcularResumenes();
  const totales = calcularTotalesPorTipo();

  return (
    <div className="space-y-6">
      {/* Sección de Resúmenes */}
      <div className="rounded-lg p-6 border-2 border-primary">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Resumen Financiero
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
          {/* Columna Izquierda - Semáforo */}
          <div className="flex items-center justify-center">
            <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-4">Estado Financiero ({porcentajeMostrar.toFixed(2)}%)</h4>
                <div className="flex justify-center">
                   <div className="w-15 h-auto max-w-xs">
                     <SemaforoImg tipo={tipoSemaforo} />
                   </div>
                </div>
              <p className="text-sm text-foreground mt-4">
                {tipoSemaforo == "rojo" &&  <p>🟥 <span className="text-red-500 font-bold">Zona Roja:</span> Tus gastos están dominando tu economía. Detente y analiza antes de seguir.</p>}
                {tipoSemaforo == "amarillo" && <p>🟨 <span className="text-yellow-500 font-bold">Alerta Financiera:</span> Estás en un punto delicado. Ajusta tus gastos antes de que sea tarde.</p>}
                {tipoSemaforo == "verde" &&  <p>🟩 <span className="text-green-500 font-bold">Estabilidad:</span> Manejas tus finanzas con sabiduría. Mantén el equilibrio y sigue ahorrando.</p>}
              </p>
            </div>
          </div>

          {/* Columna Derecha - Resúmenes Numéricos */}

            {/* Promedio Diario */}
            <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Promedio Diario
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">Ingresos:</span>
                  <span className="font-semibold text-green-600">
                    {formatMoney(resumenes.promedioDiario.ingresos, "PYG")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Gastos:</span>
                  <span className="font-semibold text-red-600">
                    {formatMoney(resumenes.promedioDiario.gastos, "PYG")}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">  
                  <span className="text-foreground">Ganancia:</span>
                  <span className={`font-bold ${resumenes.promedioDiario.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(resumenes.promedioDiario.ganancia, "PYG")}
                  </span>
                </div>
              </div>
            </div>

            {/* Promedio Mensual */}
            <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Promedio Mensual
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">Ingresos:</span>
                  <span className="font-semibold text-green-600">
                    {formatMoney(resumenes.promedioMensual.ingresos, "PYG")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Gastos:</span>
                  <span className="font-semibold text-red-600">
                    {formatMoney(resumenes.promedioMensual.gastos, "PYG")}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-foreground">Ganancia:</span>
                  <span className={`font-bold ${resumenes.promedioMensual.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(resumenes.promedioMensual.ganancia, "PYG")}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumen de Ganancias */}
            <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                Resultado (Total en Guaraníes)
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">Saldo Total:</span>
                  <span className={`font-semibold ${resumenes.saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(resumenes.saldoTotal, "PYG")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Mensual:</span>
                  <span className={`font-semibold ${resumenes.promedioMensual.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(resumenes.promedioMensual.ganancia, "PYG")}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-foreground">Diario:</span>
                  <span className={`font-semibold ${resumenes.promedioDiario.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(resumenes.promedioDiario.ganancia, "PYG")}
                  </span>
                </div>
              </div>
            </div>
          
        </div>
      </div>

      {/* Cards de Ingresos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingresos.map(({ tipo, count }) => {
          const config = getTipoMovimientoConfig(tipo);
          const Icon = config.icon;
          
          // Calcular total en guaraníes para este tipo
          let totalTipo = 0;
          let saldosGenerales = 0;
          switch (tipo) {
            case 1:
              totalTipo = totales.ingresoFijo;
              break;
            case 2:
              totalTipo = totales.ingresoOcasional;
              break;
            case 6:
              totalTipo = totales.ingresosPorCobrar;
              saldosGenerales = totales.ingresosSaldosCobrar;
              break;
          }

          return (
            <Card
              key={tipo}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-primary border-2`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {config.label}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <Button
                    className="h-10 w-10 p-0 hover:opacity-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      let tipoMovimiento;
                      let titulo;
                      switch (tipo) {
                        case 1:
                          tipoMovimiento = TIPOS_MOVIMIENTOS.INGRESO_FIJO;
                          titulo = "Registrar Ingreso Fijo";
                          break;
                        case 2:
                          tipoMovimiento = TIPOS_MOVIMIENTOS.INGRESO_EXTRA;
                          titulo = "Registrar Ingreso Extra";
                          break;
                        case 6:
                          tipoMovimiento = TIPOS_MOVIMIENTOS.CUENTAS_POR_COBRAR;
                          titulo = "Registrar Cuenta por Cobrar";
                          break;
                      }
                      abrirFormularioMovimiento(tipoMovimiento, titulo);
                    }}
                  >
                    <Plus className="h-10 w-10" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`text-2xl font-bold ${config.color}`}>
                  {count}
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {formatMoney(totalTipo, "PYG")}
                </div>
                {
                  saldosGenerales > 0 && (
                    <div className="text-sm font-bold text-yellow-600">
                      Por Cobrar: {formatMoney(saldosGenerales, "PYG")}
                    </div>
                  )
                }
                <p className="text-xs text-muted-foreground">
                  Tipo de movimiento ({config.label})
                </p>
                <Button  variant="outline" size="sm" className="w-full mt-2"
                 onClick={() => handleCardClick(tipo)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Movimientos ({obtenerMovimientosPorTipo(tipo).length})
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Cards de Egresos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {egresos.map(({ tipo, count }) => {
          const config = getTipoMovimientoConfig(tipo);
          const Icon = config.icon;
          
          // Calcular total en guaraníes para este tipo
          let totalTipo = 0;
          let saldosGenerales = 0;
          switch (tipo) {
            case 3:
              totalTipo = totales.gastoFijo;
              break;
            case 4:
              totalTipo = totales.gastoOcasional;
              break;
            case 5:
              totalTipo = totales.egresosPorPagar;
              saldosGenerales = totales.egresosSaldosPagar;
              break;
          }

          return (
            <Card
              key={tipo}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-primary border-2 `}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {config.label}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <Button
                    className="h-10 w-10 p-0 hover:opacity-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      let tipoMovimiento;
                      let titulo;
                      switch (tipo) {
                        case 3:
                          tipoMovimiento = TIPOS_MOVIMIENTOS.GASTO_FIJO;
                          titulo = "Registrar Gasto Fijo";
                          break;
                        case 4:
                          tipoMovimiento = TIPOS_MOVIMIENTOS.GASTO_EXTRA;
                          titulo = "Registrar Gasto Extra";
                          break;
                        case 5:
                          tipoMovimiento = TIPOS_MOVIMIENTOS.CUENTAS_POR_PAGAR;
                          titulo = "Registrar Cuenta por Pagar";
                          break;
                      }
                      abrirFormularioMovimiento(tipoMovimiento, titulo);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`text-2xl font-bold ${config.color}`}>
                  {count}
                </div>
                <div className="text-lg font-semibold text-red-600">
                  {formatMoney(totalTipo, "PYG")}
                </div>
                {
                  saldosGenerales > 0 && (
                    <div className="text-sm font-bold text-yellow-600">
                      Por Pagar: {formatMoney(saldosGenerales, "PYG")}
                    </div>
                  )
                }
                <p className="text-xs text-muted-foreground">
                  Tipo de movimiento ({config.label})
                </p>
                <Button variant="outline" size="sm" className="w-full mt-2"
                 onClick={() => handleCardClick(tipo)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Movimientos ({obtenerMovimientosPorTipo(tipo).length})
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog para mostrar abonos */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTipo && (
                <>
                  <selectedTipo.config.icon
                    className={`h-5 w-5 ${selectedTipo.config.color}`}
                  />
                  Movimientos - {selectedTipo.config.label}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({selectedTipo.movimientos.length} movimiento
                    {selectedTipo.movimientos.length !== 1 ? "s" : ""})
                  </span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedTipo && (
            <div className="space-y-4">
              {selectedTipo.movimientos.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    No hay movimientos registrados
                  </p>
                  <p className="text-sm text-muted-foreground">
                    para el tipo:{" "}
                    <span className="font-medium">
                      {selectedTipo.config.label}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTipo.movimientos.map((movimiento) => (
                    <div
                      key={movimiento.id}
                      className="border rounded-lg p-4 hover:opacity-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-base">
                              {movimiento.titulo || movimiento.descripcion} - {formatDate(movimiento.fecha_creacion)}
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Monto:
                              </span>
                              <p className="font-medium">
                                {formatMoney(
                                  movimiento.monto,
                                  getMonedaDescripcion(movimiento.id_moneda)
                                )}
                              </p>
                            </div>
                            {/* Solo mostrar Abonos realizados para por_pagar y por_cobrar */}
                            {(selectedTipo.tipo === 5 || selectedTipo.tipo === 6) && (
                              <div>
                                <span className="text-muted-foreground">
                                  Abonos
                                </span>
                                <p className="font-medium text-blue-600">
                                  {movimiento.abonos?.length || 0}
                                </p>
                              </div>
                            )}
                            {/* Solo mostrar Estado para por_pagar y por_cobrar */}
                            {(selectedTipo.tipo === 5 || selectedTipo.tipo === 6) && (
                              <div>
                                <span className="text-muted-foreground">
                                  {selectedTipo.tipo == 5 ? "Por Pagar" : "Por Cobrar"}
                                </span>
                                <p className="font-medium text-yellow-500 ">
                                  {formatMoney(
                                    movimiento.saldo,
                                    getMonedaDescripcion(movimiento.id_moneda)
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                          {/* Solo mostrar badge de estado para por_pagar y por_cobrar */}
                          {(selectedTipo.tipo === 5 || selectedTipo.tipo === 6) && movimiento.id_estado && (
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  getEstadoDescripcion(movimiento.id_estado) === "Vencido"
                                    ? "bg-red-100 text-red-800"
                                    : getEstadoDescripcion(movimiento.id_estado) ===
                                      "Pendiente"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {getEstadoDescripcion(movimiento.id_estado)}
                              </span>
                            </div>
                          )}
                        </div>
                        {(movimiento.abonos?.length || 0) > 0 && (
                          <div className="mx-4 text-right">
                            <p className="text-lg font-bold text-green-600">
                              {formatMoney(
                                calcularTotalGS(movimiento.abonos),
                                "PYG"
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total abonado (GS)
                            </p>
                          </div>
                        )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                >
                                  <MoreVertical className="h-10 w-10" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditMovimiento(movimiento.id, movimiento.descripcion)
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteMovimiento(
                                      movimiento.id,
                                      movimiento.titulo || movimiento.descripcion
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                                {/* Solo mostrar opciones de abonos para por_pagar y por_cobrar */}
                                {(selectedTipo.tipo === 5 || selectedTipo.tipo === 6) && (
                                  <>
                                    {(movimiento.abonos?.length || 0) > 0 && (
                                      <DropdownMenuItem
                                        onClick={() => handleVerAbonos(movimiento)}
                                      >
                                        <Receipt className="h-4 w-4 mr-2" />
                                        Ver Abonos ({movimiento.abonos.length})
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRegistrarAbono(movimiento)
                                      }
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Registrar Abono
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar detalles de abonos */}
      <Dialog
        open={abonosDialog.open}
        onOpenChange={(open) => setAbonosDialog({ open, movimiento: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Abonos - {abonosDialog.movimiento?.titulo || abonosDialog.movimiento?.descripcion}
            </DialogTitle>
          </DialogHeader>

          {abonosDialog.movimiento && (
            <div className="space-y-4">
              {/* Información del movimiento */}
              <div className="rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Monto del movimiento:
                    </span>
                    <p className="font-semibold">
                      {formatMoney(
                        abonosDialog.movimiento?.monto,
                        getMonedaDescripcion(abonosDialog.movimiento?.id_moneda)
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Total de abonos:
                    </span>
                    <p className="font-semibold text-blue-600">
                      {abonosDialog.movimiento.abonos?.length || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Total abonado:
                    </span>
                    <p className="font-semibold text-green-600">
                      {formatMoney(
                        abonosDialog.movimiento.acumulado || 0,
                        getMonedaDescripcion(abonosDialog.movimiento?.id_moneda)
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Pendiente:
                    </span>
                    <p className="font-semibold text-yellow-600">
                      {formatMoney(
                        abonosDialog.movimiento.saldo || 0,
                        getMonedaDescripcion(abonosDialog.movimiento?.id_moneda)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cards de abonos */}
              {abonosDialog.movimiento.abonos &&
              abonosDialog.movimiento.abonos.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {abonosDialog.movimiento.abonos.map((abono) => {
                      return (
                        <Card key={abono.id} className="relative hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-base">
                              <span className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-blue-600" />
                                Abono #{abono.id}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {getMonedaDescripcion(abono?.id_moneda)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAbono(abono.id, abono.monto_abono, abonosDialog.movimiento.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Monto:</span>
                                <span className="font-semibold">
                                  {formatMoney(
                                    abono.monto_abono,
                                    getMonedaDescripcion(abono?.id_moneda)
                                  )}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Fecha de Abono:</span>
                                <span className="text-sm flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  {formatDate(abono.fecha_abono)}
                                </span>
                              </div>
                              
                              {abono.observacion && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Observación:</span>
                                  <span className="text-sm">
                                    {abono.observacion}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay abonos registrados para este movimiento
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de edición de movimiento */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && cerrarEditDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Movimiento</DialogTitle>
            <DialogDescription>
              Actualiza los datos del movimiento: {editDialog.titulo}
            </DialogDescription>
          </DialogHeader>
          {editDialog.movimientoId && (
            <FormSemaforoFinancieroMovimiento
              id_movimiento={editDialog.movimientoId}
              onSuccess={onEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para registrar abono */}
      <Dialog open={abonoDialog.open} onOpenChange={(open) => !open && cerrarAbonoDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Abono</DialogTitle>
            <DialogDescription>
              Registra un abono para el movimiento seleccionado
            </DialogDescription>
          </DialogHeader>
          {abonoDialog.movimiento && (
            <FormAbonoMovimiento
              movimiento={abonoDialog.movimiento}
              onSuccess={onAbonoSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              movimiento{" "}
              <span className="font-semibold">"{deleteDialog.titulo}"</span> del
              semáforo financiero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setDeleteDialog({ open: false, movimientoId: null, titulo: "" })
              }
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminarMovimiento}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmación para eliminar abono */}
      <AlertDialog open={deleteAbonoDialog.open} onOpenChange={(open) => !open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar abono?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              abono de{" "}
              <span className="font-semibold">{deleteAbonoDialog.abonoMonto}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setDeleteAbonoDialog({ open: false, abonoId: null, abonoMonto: "", movimientoId: null })
              }
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminarAbono}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Abono
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog del formulario de movimientos */}
      <Dialog
        open={formDialog.open}
        onOpenChange={(open) => !open && cerrarFormularioMovimiento()}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formDialog.titulo}</DialogTitle>
            <DialogDescription>
              Complete los datos del movimiento financiero
            </DialogDescription>
          </DialogHeader>
          <FormSemaforoFinancieroMovimiento
            tipoMovimiento={formDialog.tipoMovimiento}
            onSuccess={onFormularioSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConteoMovimientos;
