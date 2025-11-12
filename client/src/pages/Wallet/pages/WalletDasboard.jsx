import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Wallet, ArrowLeft } from "lucide-react";
import RecargasTab from "../components/RecargasTab";
import SaldosTab from "../components/SaldosTab";
import { obtenerWalletPorId } from "@/apis/wallets.api";
import { toast } from "sonner";
import { routes } from "../config/routes";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";
import { walletEvents } from "../config/events";
import { on } from "@/utils/events";

const WalletDashboard = ({ id }) => {
  const navigate = useNavigate();

  const walletId = id;

  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recargas");

  const formatMoney = (amount, currency = "PYG") => {
    return `${amount.toLocaleString("es-PY")} ${currency}`;
  };

  const handleRecargar = () => {
    navigate(`/${routes.solicitarRecarga(walletId)}`);
  };

  const handleGoBack = () => {
    navigate(`/${routes.index}`);
  };

  const loadWalletData = useCallback(async () => {
    if (!walletId) {
      toast.error("ID de wallet no válido");
      navigate(`/${routes.index}`);
      return;
    }

    try {
      setLoading(true);
      // Fetch wallet data with the new JSON structure
      const response = await obtenerWalletPorId(walletId);
      const walletData = response.data || response;

      if (!walletData || !walletData.id_wallet) {
        toast.error("Wallet no encontrada");
        navigate(`/${routes.index}`);
        return;
      }

      setWalletData(walletData);
    } catch (error) {
      console.error("Error al cargar wallet:", error);
      toast.error("Error al cargar los datos de la wallet");
      navigate(`/${routes.index}`);
    } finally {
      setLoading(false);
    }
  }, [walletId, navigate]);

  useEffect(() => {
    loadWalletData();
    // cuando se actualice la wallet, recargar datos
    const offA = on(walletEvents.ACTUALIZAR_WALLET, () => {
      loadWalletData();
    });
    return () => {
      offA();
    };
  }, [loadWalletData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Wallet no encontrada</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Wallets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header Navigation */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Wallets
          </Button>
        </div>

        {/* Header con Saldo Principal */}
        <Card className="mb-6 border-0 shadow-lg ">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    {walletData.moneda || walletData.sigla_iso}
                  </p>
                  <h1 className="text-4xl font-bold text-white">
                    {formatMoney(walletData.saldo, walletData.sigla_iso)}
                  </h1>
                  <div className="flex gap-4 mt-2">
                    <span className="text-green-100 text-sm">
                      Pendientes: {walletData.cantidad_pendientes || 0}
                    </span>
                    <span className="text-green-100 text-sm">
                      Verificados: {walletData.cantidad_verificado || 0}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRecargar}
                variant="secondary"
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 shadow-md"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Recargar
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs de Filtros */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="recargas"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Movimientos
                </TabsTrigger>
                <TabsTrigger
                  value="saldos"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Saldos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recargas" className="mt-0">
                <RecargasTab walletId={walletId} walletData={walletData} />
              </TabsContent>

              <TabsContent value="saldos" className="mt-0">
                <SaldosTab walletId={walletId} walletData={walletData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;
