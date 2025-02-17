import { useEffect, useState } from "react";
import { SIMULATOR_URL } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { PluginDisplay } from "./Plugin";

// The refresh code is a big hack. :)
export function Simulator({
  xnft,
  closePlugin,
}: {
  xnft: string;
  closePlugin: () => void;
}) {
  const theme = useCustomTheme();
  const props = { xnft, closePlugin };
  const refresh = useJavaScriptRefresh(SIMULATOR_URL);
  return refresh % 2 === 1 ? (
    <div style={{ backgroundColor: theme.custom.colors.background }}></div>
  ) : (
    <PluginDisplay {...props} />
  );
}

function useJavaScriptRefresh(url: string): number {
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let previous: any = null;
    const i = setInterval(() => {
      (async () => {
        const js = await (await fetch(url)).text();
        if (previous !== null && previous !== js) {
          setRefresh((r) => r + 1);
        }
        previous = js;
      })();
    }, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (refresh % 2 === 1) {
      setTimeout(() => {
        setRefresh((r) => r + 1);
      }, 100);
    }
  }, [refresh]);

  return refresh;
}
