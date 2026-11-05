import { useCallback, useEffect, useState } from "react";
import { getVentes } from "../api/ventes";

function useVentes(params) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(params);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getVentes(JSON.parse(paramsKey));
      setData(result);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export default useVentes;
