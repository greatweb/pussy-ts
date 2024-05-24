import { useQueryClient } from 'src/contexts/queryClient';

import { useQuery } from '@tanstack/react-query';
import { CybernetContractQuery, queryCybernetContract } from '../api';
import { useCybernet } from './cybernet.context';

type Props = {
  query: CybernetContractQuery;
  skip?: boolean;
  contractAddress?: string;
};

// TODO: copied from usePassportContract, reuse  core logic

function useQueryCybernetContract<DataType>({
  contractAddress,
  query,
  skip,
}: Props) {
  const queryClient = useQueryClient();

  const { selectedContract } = useCybernet();
  const contractAddress2 = contractAddress || selectedContract.address;

  const { refetch, data, error, isLoading } = useQuery<DataType>(
    ['queryCybernetContract', contractAddress, query],
    () => {
      return queryCybernetContract(contractAddress2, query, queryClient!);
    },
    {
      enabled: !skip && !!queryClient,
    }
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
}

export default useQueryCybernetContract;
