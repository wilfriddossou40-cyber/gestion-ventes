import { useCallback, useEffect, useState } from "react";
import {
  DASHBOARD_INVALIDATED_EVENT,
  getDashboard,
} from "../api/dashboard";

function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setData(await getDashboard());
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
    const handleInvalidation = () => {
      reload();
    };
    window.addEventListener(DASHBOARD_INVALIDATED_EVENT, handleInvalidation);

    return () => {
      window.removeEventListener(DASHBOARD_INVALIDATED_EVENT, handleInvalidation);
    };
  }, [loadData, reload]);

  return { data, loading, error, reload };
}

export default useDashboard;
