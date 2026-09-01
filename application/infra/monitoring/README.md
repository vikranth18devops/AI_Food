# FoodLens AI Enterprise Monitoring & Observability Stack

This directory contains deployment manifests, Helm overrides, and dashboards for **Prometheus**, **Grafana**, **Loki**, **ELK Stack (Elasticsearch, Logstash, Kibana)**, and **Dynatrace**.

---

## 📁 Monitoring Directory Layout

```
infra/monitoring/
├── prometheus-grafana/                # Prometheus Operator & Grafana Dashboards
│   ├── prometheus-values.yaml
│   ├── service-monitors.yaml
│   └── dashboards/foodlens-dashboard.json
│
├── loki/                              # Grafana Loki & Promtail
│   ├── loki-values.yaml
│   └── promtail-values.yaml
│
├── elk/                               # Elastic Stack
│   ├── elasticsearch-values.yaml
│   ├── logstash-configmap.yaml
│   ├── kibana-values.yaml
│   └── filebeat-values.yaml
│
└── dynatrace/                         # Dynatrace OneAgent APM
    ├── dynatrace-operator.yaml
    ├── dynakube.yaml
    └── values.yaml
```

---

## Deployment Commands

### 1. Prometheus & Grafana
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create namespace monitoring
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  -f infra/monitoring/prometheus-grafana/prometheus-values.yaml

kubectl apply -f infra/monitoring/prometheus-grafana/service-monitors.yaml
```

### 2. Grafana Loki (Log Aggregation)
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install loki grafana/loki -n monitoring -f infra/monitoring/loki/loki-values.yaml
helm install promtail grafana/promtail -n monitoring -f infra/monitoring/loki/promtail-values.yaml
```

### 3. ELK Stack (Elasticsearch, Logstash, Kibana, Filebeat)
```bash
helm repo add elastic https://helm.elastic.co
helm repo update

helm install elasticsearch elastic/elasticsearch -n monitoring -f infra/monitoring/elk/elasticsearch-values.yaml
kubectl apply -f infra/monitoring/elk/logstash-configmap.yaml
helm install kibana elastic/kibana -n monitoring -f infra/monitoring/elk/kibana-values.yaml
helm install filebeat elastic/filebeat -n monitoring -f infra/monitoring/elk/filebeat-values.yaml
```

### 4. Dynatrace APM Integration
```bash
kubectl create namespace dynatrace
kubectl apply -f https://github.com/Dynatrace/dynatrace-operator/releases/latest/download/kubernetes.yaml

# Replace secret tokens with your Dynatrace tenant API token:
kubectl create secret generic dynatrace-secret -n dynatrace \
  --from-literal=apiToken="YOUR_DYNATRACE_API_TOKEN" \
  --from-literal=dataIngestToken="YOUR_DYNATRACE_DATA_INGEST_TOKEN"

kubectl apply -f infra/monitoring/dynatrace/dynakube.yaml
```
