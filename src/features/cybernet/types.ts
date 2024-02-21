export type SubnetInfo = {
  blocks_since_last_step: number;
  burn: number;
  difficulty: number;
  emission_values: number;
  immunity_period: number;
  kappa: number;
  max_allowed_uids: number;
  max_allowed_validators: number;
  max_weights_limit: number;
  metadata: string;
  min_allowed_weights: number;
  netuid: number;
  network_modality: number;
  owner: string;
  rho: number;
  subnetwork_n: number;
  tempo: number;
};

export type Delegator = {
  delegate: string;
  take: number;
  nominators: [string, number][];
  owner: string;
  registrations: number[];
  validator_permits: number[];
  return_per_1000: number;
  total_daily_return: number;
};

export type SubnetHyperParameters = {
  rho: number;
  kappa: number;
  immunity_period: number;
  min_allowed_weights: number;
  max_weights_limit: number;
  tempo: number;
  min_difficulty: number;
  max_difficulty: number;
  weights_version: number;
  weights_rate_limit: number;
  adjustment_interval: number;
  activity_cutoff: number;
  registration_allowed: boolean;
  target_regs_per_interval: number;
  min_burn: number;
  max_burn: number;
  bonds_moving_avg: number;
  max_regs_per_block: number;
};
