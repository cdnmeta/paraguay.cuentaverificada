// hooks/useGruposEmpresa.ts
import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import { db } from "@/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getGruposByUsuario } from "@/apis/usuarios.api";

export function useGruposEmpresa(userId) {
  const setGruposEmpresa = useGruposEmpresaStore(
    (state) => state.setGruposEmpresa
  );

  useEffect(() => {
    const loadGruposEmpresa = async () => {
      let grupos = []
      const responseGrupos = await getGruposByUsuario();
      grupos = responseGrupos.data?.grupos || [];

      if(responseGrupos.data?.is_super_admin == true){
        grupos.push({id:'admin', descripcion:"Super Admin"})
      }

      setGruposEmpresa(grupos);
    };
    

    if (userId) {
      loadGruposEmpresa();
    }
  }, [userId, setGruposEmpresa]);
}
