#!/bin/bash

ts-node src/graph/importCondos.ts
ts-node src/graph/importStations.ts
ts-node src/graph/importOSM.ts
ts-node src/graph/importNearness.ts
ts-node src/graph/importCluster.ts
