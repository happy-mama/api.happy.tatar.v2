import { Injectable } from "@nestjs/common";
import * as os from "os";

@Injectable()
export class AppService {
  getStatus(): GORT["serverStatus"] {
    const cpu = os.cpus();

    return {
      type: "serverStatus",
      serverStatus: {
        platform: os.platform(),
        freeMem: (os.freemem() / 1024 / 1024).toFixed(0) + " MB",
        totalMem: (os.totalmem() / 1024 / 1024).toFixed(0) + " MB",
        cpuThreads: cpu.length,
        cpuName: cpu[0].model,
        cpuSpeed: (cpu[0].speed / 1000).toFixed(2) + " GHz",
      },
    };
  }
}
