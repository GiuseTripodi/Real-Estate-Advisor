

# Example Cypher Queries


### Get all condos that are "near" (<500m) of a Station that is connected to the U1
- p is the Path and is returned for visualization
```
MATCH p=(l:Line {name:"U1"})-[:SERVES]-(s:Station)-[:NEAR]-(c:Condo) RETURN p
```


### Delete all relations and nodes

```
MATCH (n)
DETACH DELETE n
```
