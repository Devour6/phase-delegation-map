export interface PoolOverview {
  latestEpoch: number;
  validatorCount: number;
  totalStakeSol: number;
  avgApy: number;
  avgCommission: number;
  avgSkipRate: number;
  avgVoteCreditsRatio: number;
  clientDiversity: Record<string, number>;
  superminorityCount: number;
}

export interface PoolValidator {
  vote_pubkey: string;
  name: string | null;
  categories: string[];
  city: string | null;
  country: string | null;
  pool_stake_sol: number;
  apy: number | null;
  epoch_credits: number;
  commission: number;
  mev_commission: number;
  client_type: number;
  skip_rate: number;
  vote_credits_ratio: number;
  is_superminority: number | null;
}

export interface DiversityResponse {
  epoch: number;
  pool: {
    clientTypes: Record<string, number>;
    countries: Record<string, number>;
    continents: Record<string, number>;
    uniqueAsns: number;
  };
  network: {
    clientTypes: Record<string, number>;
    countries: Record<string, number>;
    continents: Record<string, number>;
    uniqueAsns: number;
  };
}
