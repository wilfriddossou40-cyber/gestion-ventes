import { useCallback, useEffect, useState } from "react";
import { DASHBOARD_INVALIDATED_EVENT } from "../api/dashboard";
import { getProduitsAlertes } from "../api/produits";

function useAlertesStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getProduitsAlertes());
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const handleInvalidation = () => {
      reload();
    };
    window.addEventListener(DASHBOARD_INVALIDATED_EVENT, handleInvalidation);

    return () => {
      window.removeEventListener(DASHBOARD_INVALIDATED_EVENT, handleInvalidation);
    };
  }, [reload]);

  return { data, loading, error, reload };
}

export default useAlertesStock;
