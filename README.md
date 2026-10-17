# GitOps Task Manager — Pipeline CI/CD End-to-End mô hình GitOps

Đồ án IT209: Xây dựng ứng dụng web **Task Management** có Frontend + Backend thống nhất,
đóng gói bằng Docker, kiểm thử tự động bằng GitHub Actions, đẩy image lên **GHCR**,
và đồng bộ trạng thái triển khai lên Kubernetes bằng **Argo CD** theo mô hình **GitOps**.

---

## 1. Giới thiệu dự án

**GitOps Task Manager** là ứng dụng quản lý công việc đơn giản nhưng đầy đủ vòng đời phát triển:

- Người dùng thao tác trên giao diện React → Frontend gọi REST API → Backend Spring Boot xử lý nghiệp vụ.
- Mỗi lần push lên `main`, GitHub Actions chạy test → build → push image GHCR → commit image tag mới vào `deploy/kubernetes/`.
- Argo CD theo dõi repository, phát hiện manifests lệch (OutOfSync) và **tự động sync** lên cluster Kubernetes.
- Rollback đơn giản: đổi image tag trong Git commit về phiên bản trước → Argo CD sync lại.

Đây **không** phải dự án web thông thường — phần DevOps/GitOps là cốt lõi của đồ án.

## 2. Mục tiêu và chức năng

### Chức năng nghiệp vụ (Task Management)

| # | Chức năng | API tương ứng |
|---|-----------|---------------|
| 1 | Xem danh sách công việc | `GET /api/tasks` |
| 2 | Tạo công việc mới (có validation) | `POST /api/tasks` |
| 3 | Chỉnh sửa công việc | `PUT /api/tasks/{id}` |
| 4 | Đánh dấu hoàn thành | `PUT /api/tasks/{id}/status?status=COMPLETED` |
| 5 | Xóa công việc (UI có xác nhận) | `DELETE /api/tasks/{id}` |
| 6 | Lọc theo trạng thái | `GET /api/tasks?status=PENDING` |
| 7 | Tổng số / đã hoàn thành | `GET /api/tasks/stats` |
| 8 | Trạng thái hệ thống và phiên bản | `GET /api/health`, `GET /api/version` |

Trạng thái hợp lệ: `PENDING`, `IN_PROGRESS`, `COMPLETED`.

### Mục tiêu DevOps/GitOps

- Tự động test Frontend (Vitest) và Backend (JUnit) — **test fail thì không publish image**.
- Đóng gói FE/BE bằng Docker multi-stage, image bất biến theo **commit SHA 12 ký tự**.
- Push image lên GitHub Container Registry (GHCR).
- Tự động cập nhật `image:` tag trong GitOps manifests qua commit của `github-actions[bot]`.
- Argo CD đồng bộ manifests lên Kubernetes namespace `gitops-demo`.
- Hỗ trợ rollback bằng cách revert commit bump image tag.

## 3. Kiến trúc hệ thống

```
                         ┌─────────────────────────────────────────────┐
                         │              Kubernetes (gitops-demo)        │
                         │                                              │
 Người dùng ──HTTP──► Ingress (nginx) ──/api──► Service backend:8080 ──►│ Pod Backend  │
                         │                    └─/────► Service          │ (Spring Boot)│
                         │                               frontend:80 ──►│ Pod Frontend │
                         │                                             │ (Nginx+React)│
                         └─────────────────────────────────────────────┘
                                      ▲ desired state (Git)
                                      │
                              Argo CD (auto-sync)
                                      ▲
                                      │ commit image tag
                         ┌────────────┴────────────┐
                         │  GitHub Actions CI/CD    │
                         │  test → build → push GHCR│
                         └─────────────────────────┘
```

**Lưu ý:** Backend lưu dữ liệu **in-memory** (`InMemoryTaskRepository`) — phù hợp phạm vi đồ án,
không cần database, không có persistent volume. Xem mục 14 về trade-off này.

### Phương án kết nối Frontend ↔ Backend

Chọn **Ingress định tuyến theo path** trên Kubernetes:

- `/api/*` → Service `backend:8080`
- `/*` → Service `frontend:80`

Lý do: Frontend production là static file (Nginx), gọi API cùng origin (`/api/tasks`) nên
**không cần CORS**, không hardcode localhost. Docker Compose local mô phỏng đúng kiến trúc này
bằng một container nginx-proxy (`deploy/nginx-proxy.conf`) route `/api` → `backend:8080`.

Khi phát triển local (không Docker), Vite dev server proxy `/api` → `http://localhost:8080`
qua cấu hình trong `frontend/vite.config.ts`.

## 4. Sơ đồ CI/CD GitOps

```
git push (main)
   │
   ▼
┌────────────────────┐   ┌─────────────────────┐
│ job: test-backend  │   │ job: test-frontend   │   (chạy song song)
│ Gradle test (16)   │   │ Vitest (7) + build  │
└─────────┬──────────┘   └──────────┬──────────┘
          └───────────┬─────────────┘
                      ▼ (cả hai pass mới chạy tiếp)
          ┌───────────────────────────┐
          │ job: build-push           │  chỉ khi push vào main
          │ docker build FE + BE      │
          │ push ghcr.io/...:{sha12}  │
          │         + :latest         │
          └─────────────┬─────────────┘
                        ▼
          ┌───────────────────────────┐
          │ job: update-gitops        │
          │ sed image tag trong       │
          │ deploy/kubernetes/*.yaml  │
          │ commit + push [skip ci]   │
          └─────────────┬─────────────┘
                        ▼
          ┌───────────────────────────┐
          │ Argo CD detect OutOfSync  │
          │ auto-sync → Kubernetes    │
          └───────────────────────────┘
```

Nguyên tắc GitOps được tuân thủ:

- GitHub Actions **không** chạy `kubectl apply` — chỉ Argo CD tác động lên cluster.
- Image tag theo commit SHA → truy xuất được nguồn gốc build.
- PR chỉ chạy test, **không** push image, **không** cập nhật GitOps.

## 5. Cây thư mục

```
Mo_HiNH_GITOPS/
├── frontend/                      # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/            # UI components (Dashboard, TaskList, Form...)
│   │   └── __tests__/             # 7 unit tests (Vitest + Testing Library)
│   ├── Dockerfile                 # multi-stage: node build → nginx serve
│   ├── nginx.conf                 # SPA fallback + cache assets
│   ├── vite.config.ts             # dev proxy /api → localhost:8080
│   └── package.json
├── backend/                       # Spring Boot 3 + Java 17 + Gradle
│   ├── src/main/java/com/ptit/gitops/lab/
│   │   ├── controller/            # TaskController, AppController (health/version)
│   │   ├── service/               # TaskService (nghiệp vụ)
│   │   ├── repository/            # InMemoryTaskRepository
│   │   ├── dto/                   # TaskRequest (validation), TaskResponse, StatsResponse
│   │   ├── model/                 # Task entity
│   │   └── exception/             # GlobalExceptionHandler, NotFoundException
│   ├── src/test/                  # 16 unit tests (JUnit 5)
│   └── Dockerfile                 # multi-stage: gradle build → JRE run (không root)
├── deploy/
│   ├── docker-compose.yml         # chạy toàn bộ local tại :30080
│   ├── nginx-proxy.conf           # edge proxy mô phỏng Ingress
│   ├── kubernetes/                # ★ GitOps manifests (Argo CD theo dõi thư mục này)
│   │   ├── namespace.yaml
│   │   ├── frontend-deployment.yaml / frontend-service.yaml
│   │   ├── backend-deployment.yaml  / backend-service.yaml
│   │   └── ingress.yaml
│   └── argocd/
│       └── application.yaml       # Argo CD Application (apply 1 lần)
├── .github/workflows/ci-cd.yaml  # pipeline CI/CD GitOps
├── prompt.md                      # yêu cầu đồ án
└── README.md                      # tài liệu này
```

## 6. Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5, Vitest + Testing Library |
| Backend | Java 17, Spring Boot 3.4, Spring Validation, JUnit 5, Gradle 8.12 |
| Docker | Multi-stage build, nginx:1.27-alpine, eclipse-temurin:17-jre-alpine |
| CI/CD | GitHub Actions, GHCR (ghcr.io) |
| GitOps | Argo CD |
| Kubernetes | Deployment, Service (ClusterIP), Ingress (nginx), probes, resources |
| Database | Không dùng — lưu in-memory (xem mục 14) |

## 7. Hướng dẫn chạy local (không Docker)

**Backend** (cần JDK 17):

```powershell
cd backend
.\gradlew.bat bootRun          # chạy tại http://localhost:8080
```

**Frontend** (cần Node 20+):

```powershell
cd frontend
npm ci
npm run dev                    # chạy tại http://localhost:5173, Vite proxy /api → :8080
```

Kiểm tra nhanh:

```powershell
Invoke-WebRequest http://localhost:8080/api/health
Invoke-WebRequest http://localhost:8080/api/version
```

## 8. Hướng dẫn Docker Compose (khuyến nghị demo local)

```powershell
cd deploy
docker compose up -d --build            # build + khởi động toàn bộ
docker compose ps                       # cả 3 container phải (healthy)
docker compose logs -f backend          # xem log backend
docker compose logs -f frontend proxy
```

Mở **http://localhost:30080** — proxy route `/api` → backend, `/` → frontend.

Dừng hệ thống (không xóa volume/vì backend không có volume dữ liệu):

```powershell
docker compose down
```

Kiểm tra end-to-end qua proxy:

```powershell
# Danh sách + stats
Invoke-WebRequest http://localhost:30080/api/tasks
Invoke-WebRequest http://localhost:30080/api/tasks/stats

# Tạo / đổi trạng thái / xóa
Invoke-WebRequest -Uri http://localhost:30080/api/tasks -Method POST `
  -Body '{"title":"Test","description":"demo","status":"PENDING"}' `
  -ContentType "application/json"
Invoke-WebRequest -Uri "http://localhost:30080/api/tasks/1/status?status=COMPLETED" -Method PUT
Invoke-WebRequest -Uri "http://localhost:30080/api/tasks/1" -Method DELETE
```

## 9. Hướng dẫn GitHub Actions và GHCR

Pipeline: `.github/workflows/ci-cd.yaml`, kích hoạt khi **push vào `main`** có thay đổi
`backend/**`, `frontend/**` hoặc chính workflow; pull request chỉ chạy test.

| Job | Nội dung | Chạy khi |
|-----|----------|----------|
| `test-backend` | `./gradlew test` (16 tests) | push + PR |
| `test-frontend` | `npm ci`, `npm test` (7 tests), `npm run build` | push + PR |
| `build-push` | Build 2 image, push `ghcr.io/{repo}-backend:{sha12}` và `{repo}-frontend:{sha12}` + `:latest` | chỉ push main, sau khi 2 job test pass |
| `update-gitops` | `sed` đổi `image:` tag trong `deploy/kubernetes/`, commit `[skip ci]` | sau build-push |

Yêu cầu cấu hình:

1. Repository phải bật **Actions** và cho phép ghi package: `Settings → Actions → General → Workflow permissions → Read and write permissions`.
2. Package GHCR ở chế độ **Public** (hoặc grant `GITHUB_TOKEN` đúng namespace) để cluster tải image.
3. Image name tự sinh từ `github.repository` (đã lowercase), ví dụ:
   `ghcr.io/latp1102/mo_hinh_gitops-backend`, `ghcr.io/latp1102/mo_hinh_gitops-frontend`.

Xem kết quả: **Actions** tab; image: `https://github.com/latp1102/Mo_HiNH_GITOPS/pkgs/`.

## 10. Hướng dẫn triển khai Kubernetes

Manifests trong `deploy/kubernetes/` là **nguồn sự thật (single source of truth)** cho Argo CD.
Triển khai lần đầu trên cluster:

```bash
kubectl apply -f deploy/kubernetes/namespace.yaml
# Argo CD sẽ apply các file còn lại khi tạo Application (mục 11)
# Hoặc apply thủ công nếu chưa dùng Argo CD:
kubectl apply -f deploy/kubernetes/
```

Kiểm tra:

```bash
kubectl -n gitops-demo get pods -o wide
kubectl -n gitops-demo get svc,ingress
kubectl -n gitops-demo rollout status deploy/backend
kubectl -n gitops-demo logs deploy/backend --tail=50
```

Các cấu hình an toàn đã có:

- **Readiness/Liveness probe** trên `/api/health` — Pod chỉ nhận traffic khi Backend thật sự sẵn sàng; nếu lỗi sẽ tự restart.
- **Resource requests/limits** (`cpu`, `memory`) cho cả 2 container.
- **Rolling update** với `maxUnavailable: 0, maxSurge: 1` — không downtime khi bump image.
- Cả hai Service là **ClusterIP**, chỉ Ingress công khai traffic ra ngoài.
- Image tag theo commit SHA → truy xuất được version chạy trên cluster.

Truy cập Ingress (cần ingress-nginx controller):

```bash
kubectl -n ingress-nginx get svc   # lấy địa chỉ ingress-controller
# hoặc port-forward để demo:
kubectl -n gitops-demo port-forward svc/frontend 30080:80
# mở http://localhost:30080
```

## 11. Hướng dẫn cấu hình Argo CD

Cài Argo CD (nếu cluster chưa có):

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Tạo Application theo dõi GitOps manifests:

```bash
kubectl apply -f deploy/argocd/application.yaml
```

Nội dung chính của `deploy/argocd/application.yaml`:

- `repoURL`: `https://github.com/latp1102/Mo_HiNH_GITOPS.git`
- `targetRevision`: `main`
- `path`: `deploy/kubernetes`
- `destination.namespace`: `gitops-demo`
- **Auto-sync bật**, nhưng `prune: false` và `selfHeal: false` — an toàn, không tự xóa tài nguyên,
  can thiệp tay sẽ hiện OutOfSync thay vì bị ghi đè.

Xem trạng thái:

```bash
kubectl -n argocd get applications
argocd app list            # nếu dùng CLI
argocd app waits gitops-task-manager --health --timeout 300
```

Khi pipeline commit image tag mới → Application chuyển **OutOfSync → Synced → Healthy** tự động.

**Xử lý sự cố thường gặp:**

| Tình huống | Biểu hiện | Cách xử lý |
|------------|-----------|------------|
| FE chạy nhưng BE chưa sẵn sàng | Ingress trả 502 cho `/api` | Probes đảm bảo Pod BE chỉ Ready khi health OK; thử lại sau hoặc xem `kubectl get pods` |
| Backend có lỗi sau upgrade | Pod restart lặp, `Degraded` | `kubectl logs deploy/backend`; Argo CD hiện Degraded → revert commit tag hoặc fix forward |
| Image không tải được | `ImagePullBackOff` | Kiểm tra package GHCR public + tag đúng SHA; `kubectl describe pod` |
| CrashLoopBackOff | Pod restart > 0 | Xem logs, `kubectl describe` (thiếu resource, port sai...) |
| Argo CD OutOfSync kéo dài | Application đỏ | Bấm Sync trên UI hoặc `argocd app sync`; kiểm tra RBAC của Argo CD |
| 2 image cập nhật lệch pha | FE mới + BE cũ (hoặc ngược lại) | An toàn với API bất biến; nếu Breaking Change phải bump cả 2 trong **một commit** và giữ backward-compatible 1 phiên bản |

## 12. Hướng dẫn kiểm thử

### Backend (JUnit — 16 tests)

```powershell
cd backend
.\gradlew.bat test
# báo cáo: backend/build/reports/tests/test/index.html
```

Phủ: CRUD service, validation, controller status code (201/200/204/400/404), stats, health/version.

### Frontend (Vitest — 7 tests)

```powershell
cd frontend
npm ci
npm test
npm run build          # tsc -b && vite build — bắt lỗi type
```

Phủ: parse/format types, render components, các trạng thái loading/empty/error.

### Tích hợp ( Docker Compose )

Theo mục 8 — kiểm tra qua proxy tại `:30080`: CRUD 201/200/204, validation 400, health 200.

### CI/CD

- Push commit lỗi test → pipeline đỏ → **không** có image mới trên GHCR.
- Push commit tốt → image tag SHA mới → commit bump trong `deploy/kubernetes/` → Argo CD sync.

## 13. Hướng dẫn rollback

Vì image tag là commit SHA (bất biến), rollback = trỏ manifests về tag cũ:

```powershell
# Xem lịch sử bump image
git log --oneline -- deploy/kubernetes/backend-deployment.yaml

# Rollback về commit trước
git revert HEAD          # hoặc đổi tay image tag trong 2 file deployment
git push origin main
```

Argo CD tự detect và sync về phiên bản cũ. Kiểm tra:

```bash
kubectl -n gitops-demo get pods -o jsonpath='{.items[*].spec.containers[*].image}'
kubectl -n gitops-demo rollout history deploy/backend
```

Rollback cũng có thể thực hiện không qua Git (không khuyến nghị vì phá GitOps):
`kubectl -n gitops-demo rollout undo deploy/backend` — Argo CD sẽ báo OutOfSync.

## 14. Kết quả thực tế và hạn chế

### Đã xác minh thực tế (máy development)

| Hạng mục | Kết quả | Bằng chứng |
|----------|---------|------------|
| Backend unit test | BUILD SUCCESSFUL — 16/16 pass | `.\gradlew.bat test` |
| Frontend unit test | 7/7 pass | `npm test` (Vitest) |
| Frontend build | OK (tsc + vite) | `npm run build` |
| Docker Compose | 3 container **healthy** | `docker compose ps` |
| API qua proxy | health 200, CRUD 201/200/204, validation 400 | `Invoke-WebRequest http://localhost:30080/api/...` |
| Sửa lỗi healthcheck | `localhost` → IPv6 ::1 khiến Nginx (chỉ IPv4) fail → đổi sang `127.0.0.1` | frontend/`Dockerfile`, docker-compose |

### Hạn chế (trung thực để bảo vệ)

1. **Database in-memory**: dữ liệu mất khi Pod/container restart. Lý do: giữ phạm vi đồ án tập trung vào GitOps
   pipeline; nếu bổ sung PostgreSQL cần: StatefulSet/Helm, PersistentVolume, Secret credentials,
   quy trình backup/restore — đã nêu trong yêu cầu nhưng chưa triển khai.
2. **Cluster Kubernetes**: manifests và Argo CD Application đã sẵn sàng; chạy trên cluster thực
   cần ingress-nginx + Argo CD đã cài (xem mục 10–11). Máy dev hiện tại không có cluster đang chạy.
3. **Secrets**: dự án không có secret nhạy cảm (không DB, GHCR dùng `GITHUB_TOKEN` tự động).
   Khi thêm secret, dùng Kubernetes Secret + không commit vào Git.
4. **Auto-sync với prune tắt**: an toàn cho demo; production có thể cân nhắc selfHeal.

## 15. Danh sách ảnh minh chứng (checklist khi bảo vệ)

- [ ] Giao diện Frontend (dashboard, form, filter, trạng thái loading/empty/error)
- [ ] API Backend qua Swagger/curl: `GET /api/tasks`, `POST /api/tasks`
- [ ] Unit test Backend: 16/16 pass (`gradlew test` + HTML report)
- [ ] Unit test Frontend: 7/7 pass (Vitest)
- [ ] Docker images trên GHCR (package page với tag SHA)
- [ ] GitHub Actions: run xanh (push commit tốt) và run đỏ (push commit fail test)
- [ ] Commit bump image tag của `github-actions[bot]`
- [ ] Kubernetes Pods/Services/Ingress `kubectl -n gitops-demo get all`
- [ ] Argo CD UI: application **Synced + Healthy**
- [ ] Version cũ vs mới sau khi pipeline chạy (`/api/version`, image tag trên Pod)
- [ ] Rollback: revert commit → Argo CD sync về tag cũ → kiểm tra `/api/version`

## 16. Câu hỏi bảo vệ thường gặp

**Tại sao chọn GitOps thay vì CD truyền thống (Actions kubectl apply trực tiếp)?**
→ Git là nguồn duy nhất về trạng thái mong muốn; có audit trail; rollback bằng git revert;
Argo CD continuously reconciles — phát hiện drift từ thao tác tay.

**Image tag theo SHA có lợi ích gì?**
→ Bất biến: mỗi tag trỏ đúng commit build; rollback an toàn; truy xuất nguồn gốc.

**Vì sao không dùng `:latest` trong manifests?**
→ `:latest` không xác định được nội dung, cache trên node, không rollback được. `:latest` chỉ để tham khảo.

**Backend thay đổi API breaking thì kiểm soát thế nào?**
→ Version hóa API (path `/api/v2` hoặc header), backward-compatible 1 phiên bản,
chỉ gộp FE tương ứng vào cùng lần deploy, contract test.

**Dữ liệu mất khi Pod restart — tại sao chấp nhận?**
→ Trade-off có chủ đích: đồ án tập trung vào pipeline GitOps. Giải pháp production:
PostgreSQL + PersistentVolume + Secret + backup cron (đã mô tả hướng đi).

**Prune bật nguy hiểm thế nào?**
→ Xóa tài nguyên ngoài phạm vi (ví dụ resource do người khác tạo trong namespace).
Giữ `prune: false`, chỉ sync apply — an toàn.

**Làm sao đảm bảo không push image khi test fail?**
→ Job `build-push` có `needs: [test-backend, test-frontend]` — GitHub Actions không chạy
job phụ thuộc nếu job tiền đề fail.

**Cách xử lý CrashLoopBackOff khi demo?**
→ `kubectl describe pod` xem Reason, `logs` xem stacktrace, revert commit tag nếu cần —
Argo CD tự khôi phục trạng thái Git.

---

*Tác giả: latp1102 — Đồ án IT209 GitOps CI/CD.*
