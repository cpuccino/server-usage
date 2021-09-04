import { execSync } from 'child_process';

const DELIMETER = '#!$';

const CPU_USAGE_INFO_CMD = `mpstat -P ALL -o JSON -u`;
const DISK_USAGE_INFO_CMD = `df -hT | awk '{print $1 "${DELIMETER}" $2 "${DELIMETER}" $3 "${DELIMETER}" $4 "${DELIMETER}" $5}'`;
const MEMORY_USAGE_INFO_CMD = `free -m | awk '/^Mem/ {print $2 "${DELIMETER}" $3 "${DELIMETER}" $4}'`;
const UPTIME_INFO_CMD = `uptime -p | awk -F, '{ sub(".*up", x, $1); print $1 "${DELIMETER}" $2 "${DELIMETER}" $3 }'`

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

export type Uptime = {
  days: number;
  hours: number;
  minutes: number;
}

export type SysInfo = {
  cpuLoad: CpuLoad[];
  sysname: string,
  release: string;
  arch: string;
  diskUsage: DiskUsage[];
  memoryUsage: MemoryUsage;
  uptime: Uptime;
};

function parseCpuLoad(cpuLoadRaw: { cpu: string; usr: number; idle: number }[]): CpuLoad[] {
  return cpuLoadRaw.map(({ cpu, usr, idle }) => ({
    name: cpu,
    usage: usr,
    idle
  }));
}

function parseDiskUsage(diskUsageRaw: string): DiskUsage[] {
  return diskUsageRaw
    .split('\n')
    .slice(1, -1)
    .map(entry => {
      const [partition, type, size, used, available] = entry.split(DELIMETER);
      return { partition, type, size, used, available };
    });
}

function parseMemoryUsage(memoryUsageRaw: string): MemoryUsage {
  const [total, used, free] = memoryUsageRaw.split(DELIMETER).map(info => info.trim());
  const memoryUsage = {
    total: parseInt(total),
    used: parseInt(used),
    free: parseInt(free)
  };

  return memoryUsage;
}

function parseUptime(uptimeRaw: string): Uptime {
  const uptimeFields = uptimeRaw.split(DELIMETER).map(t => t.trim()).filter(t => t);
  
  const uptime: Uptime = { days: 0, hours: 0, minutes: 0 };

  uptimeFields.forEach(field => {
    const [duration, unit] = field.split(/\s+/);
    if (unit.includes('day')) uptime.days = parseInt(duration);
    if (unit.includes('hour')) uptime.hours = parseInt(duration);
    if (unit.includes('minutes')) uptime.minutes = parseInt(duration);
  });

  return uptime;
}

export function getSysInfo(): SysInfo {
  const cpuInfoJson = execSync(CPU_USAGE_INFO_CMD).toString();
  const diskUsageRaw = execSync(DISK_USAGE_INFO_CMD).toString();
  const memoryUsageRaw = execSync(MEMORY_USAGE_INFO_CMD ).toString();
  const uptimeRaw = execSync(UPTIME_INFO_CMD).toString();

  const cpuInfo = JSON.parse(cpuInfoJson);
  const { release, sysname, machine: arch, statistics } = cpuInfo?.sysstat?.hosts[0];

  const cpuLoad = parseCpuLoad(statistics[0]['cpu-load']);
  const diskUsage = parseDiskUsage(diskUsageRaw);
  const memoryUsage = parseMemoryUsage(memoryUsageRaw);
  const uptime = parseUptime(uptimeRaw);

  const sysInfo = {
    cpuLoad,
    release,
    sysname,
    arch,
    diskUsage,
    memoryUsage,
    uptime
  };

  return sysInfo as SysInfo;
}
