export interface EC2Instance {
  "Instance ID": string
  "Instance Type": string
  State: string
  "Launch Time": string
  Name?: string
  Application?: string
  Environment?: string
  Region?: string
  AvailabilityZone?: string
  Cost?: number
  [key: string]: any
}

export interface RDSInstance {
  DBInstanceIdentifier: string
  DBInstanceClass: string
  Engine: string
  EngineVersion: string
  DBInstanceStatus: string
  MasterUsername: string
  AllocatedStorage: number
  Region: string
  AvailabilityZone: string
  [key: string]: any
}

export interface ChartData {
  labels: string[]
  values: number[]
} 