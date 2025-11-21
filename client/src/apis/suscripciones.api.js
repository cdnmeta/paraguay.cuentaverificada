
import api from "@/apis/axiosBase";

const URL_ENDPOINT = "suscripciones";

export const getMisSuscripciones = () => {
    return api.get(`/${URL_ENDPOINT}/mis-suscripciones`);

}