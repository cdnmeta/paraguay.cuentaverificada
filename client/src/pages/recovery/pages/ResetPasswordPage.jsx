import React from "react";
import FormResetPassword from "../components/FormResetPassword";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <FormResetPassword />
        
        <div className="text-center">
          <p className="text-sm text-white">
            ¿Ya tienes cuenta?{" "}
            <Link
              to={PUBLIC_ROUTES.login}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;