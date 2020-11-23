interface Network {
  label: string;
  value: string;
}

export const networks: Network[] = [
  {
    label: 'Protokol devnet',
    value: 'https://devnet-explorer.protokol.sh',
  },
  {
    label: 'Protokol testnet',
    value: 'https://testnet-explorer.protokol.sh',
  },
];
