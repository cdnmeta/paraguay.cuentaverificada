import { DatePicker } from "@/components/date-picker1";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
const cabecera = z.object({
  fechaFactura: z.date(),
});

const detalles = z.array(
  z.object({
    producto: z.string().min(2).max(100),
    cantidad: z.number().min(1),
    precio: z.number().min(0),
  })
);

const TableHeadColumns = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableCell>Cantidad</TableCell>
        <TableCell className={"w-[300px]"}>Producto</TableCell>
        <TableCell>Precio</TableCell>
        <TableCell>IVA</TableCell>
        <TableCell>Total</TableCell>
      </TableRow>
    </TableHeader>
  );
};

export default function FormFacturaPlanes() {
  const formCabecera = useForm({
    defaultValues: {
      fechaFactura: new Date(),
    },
    resolver: zodResolver(cabecera),
  });
  const formDetalles = useForm({
    resolver: zodResolver(detalles),
  });

  const detallesPrueba = [
    {
        producto: "Producto 1",
        cantidad: 1,
        precio: 100,
        ivaId:1,
        ivaExentaDescripcion:"10%",
        total:120

    },
    {
        producto: "Producto 1",
        cantidad: 1,
        precio: 100,
        ivaId:1,
        ivaExentaDescripcion:"10%",
        total:120

    },
    {
        producto: "Producto 2",
        cantidad: 1,
        precio: 100,
        ivaId:1,
        ivaExentaDescripcion:"10%",
        total:120

    }
  ]


return (
    <div className="w-full">
        <Form {...formCabecera}>
            <form className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-2 ">
                    <FormField
                        control={formCabecera.control}
                        name="fechaFactura"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Fecha
                                </FormLabel>
                                <DatePicker {...field} />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-12 md:col-span-2">
                    <FormField
                        control={formCabecera.control}
                        name="fechaFin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Ruc Comercio
                                </FormLabel>
                                <Input label="Ruc Comercio" {...field} />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className="col-span-12 md:col-span-6 lg:col-span-6">
                    <div className="flex items-end  gap-2">
                        <div className="grid w-full gap-2">
                            <Label className="text-sm font-medium">
                                Comercio Seleccionado
                            </Label>
                            <Input disabled={true} placeholder="Comercio Seleccionado" />
                        </div>
                        <Button>Buscar</Button>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-2">
                    <FormField
                        control={formCabecera.control}
                        name="nro_factura"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Factura Nro
                                </FormLabel>
                                <Input label="Colocar Nro Factura" {...field} />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
        <Separator className="my-4" />
        <div className="w-full">
            <h1 className="text-lg font-bold">Detalles de venta</h1>
        </div>

        {/*Form detalles*/}
        <Form {...formDetalles}>
            <form className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-10">
                    <FormField
                        control={formDetalles.control}
                        name="precio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Plan</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a verified email to display" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="m@example.com">
                                            m@example.com
                                        </SelectItem>
                                        <SelectItem value="m@google.com">m@google.com</SelectItem>
                                        <SelectItem value="m@support.com">
                                            m@support.com
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-12 md:col-span-2 flex flex-col justify-end">
                    <Button>Agregar Detalle</Button>
                </div>
            </form>
        </Form>
        {/*Detalles de venta*/}
        <div className="w-full">
            <p className="mt-5 font-bold">Detalles de la venta</p>
            <Table>
                <TableHeadColumns />
                <TableBody>
                    {detallesPrueba.map((detalle, index) => (
                        <TableRow key={index}>
                            <TableCell>{detalle.cantidad}</TableCell>
                            <TableCell>{detalle.producto}</TableCell>
                            <TableCell>{detalle.precio}</TableCell>
                            <TableCell>{detalle.ivaExentaDescripcion}</TableCell>
                            <TableCell>{detalle.total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                        <TableCell className="font-bold">{detallesPrueba.reduce((acc, detalle) => acc + detalle.precio, 0)}</TableCell>
                        <TableCell className="font-bold">{null}</TableCell>
                        <TableCell className="font-bold">{detallesPrueba.reduce((acc, detalle) => acc + detalle.total, 0)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    </div>
);
}
