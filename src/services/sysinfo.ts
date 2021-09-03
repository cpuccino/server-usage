import { execSync } from 'child_process';

export type CpuLoad = {
  name: string;
  usage: number;
  idle: number;
};

export type DiskUsage = {
  partition: string;
  type: string;
  size: string;
  used: string;
  available: string;
};

export type MemoryUsage = {
  total: number;
  used: number;
  free: number;
};

export type SysInfo = {
  cpuLoad: CpuLoad[];
  release: string;
  arch: string;
  diskUsage: DiskUsage[];
  memoryUsage: MemoryUsage;
};

function parseCpuLoad(cpuLoadRaw: { cpu: string; usr: number; idle: number }[]): CpuLoad[] {
  return cpuLoadRaw.map(({ cpu, usr, idle }) => ({
    name: cpu,
    usage: usr,
    idle
  }));
}

function parseDiskUsage(diskUsageRaw: string, delimeter: string): DiskUsage[] {
  return diskUsageRaw
    .split('\n')
    .slice(1, -1)
    .map(entry => {
      const [partition, type, size, used, available] = entry.split(delimeter);
      return { partition, type, size, used, available };
    });
}

function parseMemoryUsage(memoryUsageRaw: string, delimeter: string): MemoryUsage {
  const [total, used, free] = memoryUsageRaw.split(delimeter).map(info => info.trim());
  const memoryUsage = {
    total: parseInt(total),
    used: parseInt(used),
    free: parseInt(free)
  };

  return memoryUsage;
}

export function getSysInfo(): SysInfo {
  const delimeter = '#!$';

  const cpuInfoJson = execSync(`mpstat -P ALL -o JSON -u`).toString();
  const diskUsageRaw = execSync(
    `df -hT | awk '{print $1 "${delimeter}" $2 "${delimeter}" $3 "${delimeter}" $4 "${delimeter}" $5}'`
  ).toString();
  const memoryUsageRaw = execSync(
    `free -m | awk '/^Mem/ {print $2 "${delimeter}" $3 "${delimeter}" $4}'`
  ).toString();

  const cpuInfo = JSON.parse(cpuInfoJson);
  const { release, arch, statistics } = cpuInfo?.sysstat?.hosts[0];

  const cpuLoad = parseCpuLoad(statistics[0]['cpu-load']);
  const diskUsage = parseDiskUsage(diskUsageRaw, delimeter);
  const memoryUsage = parseMemoryUsage(memoryUsageRaw, delimeter);

  const sysInfo = {
    cpuLoad,
    release,
    arch,
    diskUsage,
    memoryUsage
  };

  return sysInfo as SysInfo;
}
