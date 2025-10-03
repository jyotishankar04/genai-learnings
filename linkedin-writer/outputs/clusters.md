 Ever wondered how to turn a single‑core Node app into a multi‑core powerhouse? 🚀
The answer is just one built‑in module: **cluster**.

**What’s a “cluster”?**
Imagine a restaurant kitchen with several chefs. One chef (a single thread) can only prepare one dish at a time. Adding more chefs (workers) lets the kitchen serve many orders simultaneously. In Node, the `cluster` module creates those extra chefs for you.

**Key terms, quickly:**
- **Worker** – a separate Node process that handles requests.
- **Fork** – the act of spawning a new worker, like hiring another chef.

**How to use it (quick snippet):**

```js
const cluster = require('cluster');
const http   = require('http');
const os     = require('os');

if (cluster.isMaster) {
  // 1️⃣ Start one worker per CPU core
  const cores = os.cpus().length;
  for (let i = 0; i < cores; i++) cluster.fork();

  // 2️⃣ Restart any worker that crashes
  cluster.on('exit', () => cluster.fork());
} else {
  // 3️⃣ Each worker runs its own server
  http.createServer((req, res) => {
    // Simulate CPU work
    let sum = 0;
    for (let i = 0; i < 1e7; i++) sum += i;
    res.end(`Handled by worker ${process.pid}`);
  }).listen(3000);
}
```

**Real‑world impact:**
A small image‑processing service moved from a single process to a 4‑core cluster and saw **2× higher request throughput** on the same hardware, with zero downtime when a worker crashed.

**Takeaway**
If your app does CPU‑heavy work or you need built‑in resilience, add `cluster`. A few lines unlock the full power of your machine.

⚙️ Follow me for more practical Node.js performance tips!