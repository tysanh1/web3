
interface Window {
  ethereum?: {
    on(arg0: string, arg1: () => void): unknown;
    isMetaMask?: boolean;
    request: (request: { method: string; params?: Array<any> }) => Promise<any>;
  };
}
