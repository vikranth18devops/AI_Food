# Multi-Cloud Infrastructure, Helm Chart, ArgoCD GitOps & Monitoring (Azure, AWS, GCP)

This repository contains modular Infrastructure as Code (IaC) written in Terraform, Kubernetes Helm Charts, ArgoCD GitOps manifests, GitHub Actions CI/CD workflows, and enterprise **Monitoring & Observability** stacks for **Prometheus, Grafana, Loki, ELK, and Dynatrace**.

---

## Repository Directory Structure

```
infra/
├── terraform/                # Infrastructure as Code (Azure, AWS, GCP)
├── helm/                     # Kubernetes Helm Chart (foodlens-ai)
├── argocd/                   # ArgoCD GitOps Manifests & ApplicationSets
├── monitoring/               # Enterprise Observability Stack
│   ├── prometheus-grafana/   # Prometheus Operator, ServiceMonitors, Grafana Dashboards
│   ├── loki/                 # Grafana Loki & Promtail log collector
│   ├── elk/                  # Elasticsearch, Logstash pipeline, Kibana, Filebeat
│   └── dynatrace/            # Dynatrace OneAgent Operator & DynaKube APM
└── README.md
```

---

## Observability Deployment Quick Reference

- **Prometheus & Grafana**: `kubectl apply -f infra/monitoring/prometheus-grafana/`
- **Grafana Loki**: `helm install loki grafana/loki -f infra/monitoring/loki/loki-values.yaml`
- **ELK Stack**: `helm install elasticsearch elastic/elasticsearch -f infra/monitoring/elk/elasticsearch-values.yaml`
- **Dynatrace APM**: `kubectl apply -f infra/monitoring/dynatrace/dynakube.yaml`
