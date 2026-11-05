import { useCallback, useEffect, useState } from "react";
import { getMouvementsStock } from "../api/mouvementsStock";

function useMouvementsStock(params) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(params);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getMouvementsStock(JSON.parse(paramsKey)));
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

export default useMouvementsStock;
