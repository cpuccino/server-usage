import { execSync } from "child_process";

export function getSysInfo() {
    const delimeter = '#!$'

    const cpuInfoJson = execSync(`mpstat -P ALL -o JSON -u`).toString();
    const diskUsageRaw = execSync(`df -hT | awk '{print $1 "${delimeter}" $2 "${delimeter}" $3 "${delimeter}" $4 "${delimeter}" $5}'`).toString();
    const memoryUsageRaw = execSync(`free -m | awk '/^Mem/ {print $2 "${delimeter}" $3 "${delimeter}" $4}'`).toString();

    const cpuInfo = JSON.parse(cpuInfoJson);
    const { release, machine, statistics } = cpuInfo?.sysstat?.hosts[0];
    const cpuLoad = statistics[0]['cpu-load'].map((cpu: any) => ({ name: cpu.cpu, usage: cpu.usr, idle: cpu.idle }));
    const diskUsage = diskUsageRaw.split('\n').slice(1, -1).map(entry => {
        const [partition, type, size, used, available] = entry.split(delimeter);
        return { partition, type, size, used, available };
    });
    const [total, used, free] = memoryUsageRaw.split(delimeter).map(info => info.trim());
    const memoryUsage = { total, used, free };
    
    return {
        cpuLoad,
        release,
        machine,
        diskUsage,
        memoryUsage
    };
}