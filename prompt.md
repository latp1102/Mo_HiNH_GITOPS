# YÊU CẦU MỞ RỘNG ĐỒ ÁN IT209: TÍCH HỢP FRONTEND + BACKEND VÀO HỆ THỐNG GITOPS CI/CD

Bạn hãy tiếp tục phát triển đề tài hiện tại:

**Xây dựng Pipeline CI/CD End-to-End dựa trên mô hình GitOps**, đồng thời xây dựng một ứng dụng web thực tế gồm đầy đủ Frontend và Backend, tích hợp hai phần này thành một hệ thống thống nhất và triển khai tự động.

## 1. Mục tiêu mở rộng

Không được thay thế đề tài DevOps ban đầu bằng một dự án web thông thường.

Hãy xây dựng đồng thời hai phần:

**Frontend**
- Giao diện web cho người dùng.
- Hiển thị dữ liệu do Backend cung cấp.
- Có trang tổng quan trực quan, bố cục rõ ràng, dễ trình diễn.
- Có trạng thái loading, thông báo lỗi và trạng thái dữ liệu rỗng.
- Có chức năng tương tác thực sự với Backend, không chỉ là giao diện tĩnh.
- Hiển thị phiên bản Frontend và trạng thái kết nối Backend nếu phù hợp.

**Backend**
- Xây dựng REST API có cấu trúc rõ ràng.
- Xử lý nghiệp vụ của ứng dụng.
- Cung cấp dữ liệu cho Frontend.
- Có validation, xử lý lỗi và unit test.
- Có endpoint kiểm tra sức khỏe và phiên bản.
- Có cấu hình phù hợp để chạy bằng Docker và Kubernetes.

**DevOps/GitOps**
- Tự động kiểm thử cả Frontend lẫn Backend.
- Đóng gói từng thành phần bằng Docker.
- Đẩy image lên GHCR.
- Tự động cập nhật phiên bản image trong GitOps manifest.
- Sử dụng Argo CD để đồng bộ cấu hình lên Kubernetes.
- Kiểm tra ứng dụng sau triển khai.
- Có khả năng rollback về phiên bản trước đó.

## 2. Công nghệ ưu tiên

Hãy ưu tiên bộ công nghệ sau, trừ khi môi trường hiện tại có hạn chế thực tế:

Frontend:
- React.
- TypeScript.
- Vite.
- CSS responsive hoặc thư viện giao diện nhẹ nếu thực sự cần.

Backend:
- Java 17.
- Spring Boot.
- Gradle.
- Spring Web.
- Spring Validation.
- JUnit và Spring Boot Test.

DevOps:
- Git và GitHub.
- GitHub Actions.
- Docker.
- GitHub Container Registry (GHCR).
- Kubernetes.
- Argo CD.
- YAML.
- kubectl.

Database:
- Chỉ bổ sung PostgreSQL hoặc MySQL nếu nghiệp vụ thực sự cần lưu dữ liệu lâu dài.
- Nếu có database, phải cấu hình persistent storage phù hợp, quản lý thông tin kết nối an toàn và giải thích cách backup/restore.
- Không lưu dữ liệu quan trọng trong container filesystem.
- Không commit mật khẩu database vào Git.

Ưu tiên Gradle cho Backend. Không chuyển sang Maven nếu không có lý do kỹ thuật rõ ràng.

## 3. Lựa chọn nghiệp vụ ứng dụng

Trước tiên, kiểm tra dự án hiện có để xác định ứng dụng đang làm và những chức năng đã được xây dựng.

Nếu dự án đã có nghiệp vụ cụ thể, hãy giữ nguyên nghiệp vụ đó và mở rộng Frontend + Backend.

Nếu chưa có nghiệp vụ, hãy đề xuất một ứng dụng quản lý công việc (Task Management) đơn giản nhưng đầy đủ chức năng, gồm:

1. Xem danh sách công việc.
2. Tạo công việc mới.
3. Chỉnh sửa công việc.
4. Đánh dấu hoàn thành.
5. Xóa công việc có xác nhận.
6. Lọc công việc theo trạng thái.
7. Hiển thị tổng số công việc và số công việc đã hoàn thành.
8. Hiển thị trạng thái hệ thống và phiên bản đang chạy.

Nếu dùng database, dữ liệu phải được lưu thực sự và còn tồn tại sau khi Pod được tạo lại.

Không xây dựng một hệ thống quá lớn. Ưu tiên hoàn thành chức năng cốt lõi, dễ kiểm thử, dễ demo và dễ giải thích khi bảo vệ.

## 4. Kiến trúc Frontend và Backend

Thiết kế kiến trúc sao cho Frontend và Backend hoạt động thống nhất.

Luồng xử lý:

Người dùng → React Frontend → REST API → Spring Boot Backend → Database nếu có.

Frontend không được truy cập database trực tiếp.

Backend là nơi xử lý nghiệp vụ và validation. Không chỉ kiểm tra dữ liệu ở giao diện.

Cấu hình đường dẫn API phù hợp với môi trường triển khai. Không hardcode địa chỉ localhost vào bản Frontend production nếu điều đó khiến ứng dụng không hoạt động trong Kubernetes.

Chọn một trong các phương án kết nối phù hợp:

- Dùng Nginx phục vụ Frontend và reverse proxy các yêu cầu `/api` đến Backend.
- Hoặc sử dụng Ingress để định tuyến Frontend và Backend.
- Hoặc chọn phương án tương đương phù hợp với Kubernetes cluster hiện có.

Hãy giải thích phương án được chọn và lý do.

Đối với môi trường local, cung cấp cấu hình chạy Frontend và Backend độc lập hoặc bằng Docker Compose.

Đối với Kubernetes, sử dụng Service nội bộ cho Backend và chỉ công khai các endpoint thực sự cần thiết.

Nếu cần CORS, cấu hình đúng origin được phép. Không sử dụng cấu hình cho phép mọi origin một cách tùy tiện.

## 5. Cấu trúc repository

Hãy đề xuất cấu trúc thư mục rõ ràng, ví dụ:

project-root/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .dockerignore
├── backend/
│   ├── src/
│   ├── build.gradle
│   ├── settings.gradle
│   ├── Dockerfile
│   └── .dockerignore
├── deploy/
│   ├── docker-compose.yml
│   └── kubernetes/
│       ├── namespace.yaml
│       ├── frontend-deployment.yaml
│       ├── frontend-service.yaml
│       ├── backend-deployment.yaml
│       ├── backend-service.yaml
│       └── ingress.yaml
├── .github/
│   └── workflows/
│       └── ci-cd.yaml
├── docs/
├── screenshots/
└── README.md

Đây chỉ là cấu trúc tham khảo. Hãy điều chỉnh theo dự án hiện tại, không tạo các file trùng lặp hoặc làm mất cấu hình đang hoạt động.

Nếu có database, bổ sung cấu hình cần thiết và không đưa dữ liệu nhạy cảm vào repository.

## 6. Docker hóa hai thành phần

Tạo Dockerfile riêng cho Frontend và Backend.

Frontend:
- Build React bằng Vite.
- Dùng multi-stage build nếu phù hợp.
- Phục vụ bản build bằng Nginx hoặc máy chủ web production phù hợp.
- Cấu hình reverse proxy `/api` nếu kiến trúc sử dụng Nginx.
- Không chứa token hoặc secret trong image.
- Xử lý đúng đường dẫn tài nguyên và cấu hình production.

Backend:
- Build ứng dụng Spring Boot bằng Gradle.
- Ưu tiên multi-stage build.
- Chạy bằng JRE phù hợp với phiên bản Java đã chọn.
- Không chạy bằng root nếu có thể.
- Cấu hình cổng, health endpoint và logging.
- Không đưa thông tin bí mật vào image.

Tạo Docker Compose để có thể chạy thử toàn bộ ứng dụng trên máy local. Nếu có database, phải cấu hình network, volume và healthcheck phù hợp.

Cung cấp lệnh build, chạy, kiểm tra log và dừng hệ thống. Không xóa volume dữ liệu khi dừng ứng dụng trừ khi tôi yêu cầu.

## 7. CI/CD cho cả Frontend và Backend

Thiết kế GitHub Actions để kiểm tra cả hai phần.

Các bước bắt buộc phù hợp với dự án:

1. Checkout source code.
2. Thiết lập Node.js cho Frontend.
3. Cài dependencies theo lockfile.
4. Chạy lint nếu đã cấu hình.
5. Chạy unit test Frontend nếu có.
6. Build Frontend.
7. Thiết lập JDK 17 cho Backend.
8. Chạy Gradle unit test.
9. Build Backend.
10. Build Docker image Frontend.
11. Build Docker image Backend.
12. Push các image đã vượt qua kiểm thử lên GHCR.
13. Cập nhật image tag tương ứng trong cấu hình GitOps.
14. Để Argo CD phát hiện và đồng bộ thay đổi.

Có thể dùng một workflow hoặc nhiều workflow tùy cách tổ chức. Hãy lựa chọn cách đơn giản, dễ bảo trì và giải thích được.

Yêu cầu:

- Không publish image nếu test hoặc build bắt buộc thất bại.
- Không triển khai production từ pull request chưa được tin cậy.
- Chỉ cập nhật GitOps sau khi các bước kiểm thử cần thiết thành công.
- Có tag image theo commit SHA hoặc cơ chế phiên bản bất biến.
- Frontend và Backend phải được version hóa rõ ràng.
- Nếu chỉ một thành phần thay đổi, có thể tối ưu pipeline để không build lại thành phần không liên quan, nhưng không được làm tăng độ phức tạp không cần thiết.
- Nếu Backend có thay đổi API không tương thích với Frontend, hãy giải thích cách kiểm soát tương thích phiên bản.

GitHub Actions không được trực tiếp thực hiện `kubectl apply` lên cluster trong luồng GitOps chính. Argo CD chịu trách nhiệm đồng bộ trạng thái triển khai từ Git.

## 8. GitOps và Kubernetes

Tích hợp cả Frontend và Backend vào Kubernetes.

Tạo các tài nguyên phù hợp:

- Namespace.
- Frontend Deployment.
- Frontend Service.
- Backend Deployment.
- Backend Service.
- Ingress hoặc reverse proxy theo kiến trúc đã chọn.
- ConfigMap cho cấu hình không nhạy cảm.
- Secret hoặc cơ chế quản lý secrets phù hợp nếu cần.
- Readiness probe.
- Liveness probe.
- Resource requests và limits.
- Rolling update.
- Image tag có thể truy xuất về commit.

Nếu dùng database, phải giải thích rõ cách triển khai, lưu trữ dữ liệu bền vững, cấu hình credentials và backup. Không mặc định rằng dữ liệu trong container sẽ tự tồn tại sau khi Pod bị thay thế.

Cấu hình Argo CD theo dõi đúng Git repository, branch và đường dẫn manifests.

Khi GitOps manifest thay đổi, Argo CD phải đồng bộ cả Frontend và Backend theo trạng thái mong muốn.

Giải thích cách xử lý khi:

- Frontend mới chạy nhưng Backend chưa sẵn sàng.
- Backend mới có lỗi.
- Image không tải được.
- Pod bị CrashLoopBackOff.
- Argo CD báo OutOfSync hoặc Degraded.
- Một trong hai image được cập nhật nhưng thành phần còn lại chưa được cập nhật.

Không được bật prune hoặc xóa tài nguyên một cách tùy tiện. Phải kiểm tra phạm vi tài nguyên Argo CD quản lý trước khi bật các tùy chọn tự động.

## 9. Kiểm thử tích hợp

Phải kiểm thử thực tế, không chỉ tạo mã nguồn.

Kiểm tra Frontend:
- Build thành công.
- Giao diện tải được.
- Các trạng thái loading, lỗi và dữ liệu rỗng hoạt động đúng.
- Các thao tác giao diện gọi API thực tế.

Kiểm tra Backend:
- Unit test thành công.
- Validation hoạt động.
- API trả đúng dữ liệu và mã HTTP.
- Health endpoint hoạt động.
- Xử lý lỗi rõ ràng.

Kiểm tra tích hợp:
- Frontend gọi Backend thành công.
- Tạo, xem, sửa và xóa dữ liệu hoạt động.
- Nếu có database, dữ liệu được lưu bền vững.
- Các endpoint được định tuyến chính xác.
- Không gặp lỗi CORS hoặc cấu hình localhost trong môi trường production.

Kiểm tra CI/CD:
- Push code kích hoạt workflow.
- Unit test thất bại làm pipeline thất bại.
- Không publish image của commit lỗi.
- Image mới được đưa lên GHCR.
- GitOps manifest được cập nhật.
- Argo CD đồng bộ.
- Frontend và Backend phiên bản mới hoạt động.
- Rollback khôi phục được phiên bản đã triển khai trước đó.

Mỗi kết quả phải có lệnh kiểm tra hoặc bằng chứng tương ứng. Không tự tạo log giả hoặc khẳng định đã thành công khi chưa chạy.

## 10. Giao diện và trải nghiệm người dùng

Hãy thiết kế Frontend có giao diện hiện đại, dễ nhìn và phù hợp với đồ án sinh viên.

Yêu cầu:
- Responsive trên máy tính và điện thoại.
- Bố cục rõ ràng.
- Các nút có chức năng thực sự.
- Thông báo thành công và thất bại.
- Form có validation.
- Loading indicator khi gọi API.
- Xử lý lỗi khi Backend mất kết nối.
- Có thể hiển thị thông tin phiên bản ứng dụng phục vụ demo CI/CD.

Không sử dụng dữ liệu giả để thay thế API thật trong bản triển khai chính. Có thể sử dụng dữ liệu mẫu ban đầu nếu được giải thích rõ.

## 11. Tài liệu, bằng chứng và bảo vệ

Cập nhật README bằng tiếng Việt có dấu, bao gồm:

1. Giới thiệu dự án.
2. Mục tiêu và chức năng.
3. Kiến trúc Frontend, Backend và Database nếu có.
4. Sơ đồ CI/CD GitOps.
5. Cây thư mục.
6. Công nghệ sử dụng.
7. Hướng dẫn chạy local.
8. Hướng dẫn Docker Compose.
9. Hướng dẫn GitHub Actions và GHCR.
10. Hướng dẫn triển khai Kubernetes.
11. Hướng dẫn cấu hình Argo CD.
12. Hướng dẫn kiểm thử.
13. Hướng dẫn rollback.
14. Kết quả thực tế và hạn chế.

Lập danh sách ảnh minh chứng:
- Giao diện Frontend.
- API Backend.
- Unit test Frontend và Backend.
- Docker images trên GHCR.
- GitHub Actions thành công và thất bại.
- Kubernetes Pods và Services.
- Argo CD Synced và Healthy.
- Phiên bản cũ và mới sau triển khai.
- Kết quả rollback.

Chuẩn bị câu hỏi bảo vệ về kiến trúc ứng dụng, REST API, Docker, CI, CD, GitOps, Kubernetes, Argo CD, bảo mật secrets và xử lý sự cố.

## 12. Cách thực hiện

Trước khi sửa code:

1. Đọc repository và các file hiện có.
2. Xác định phần nào đã hoàn thành.
3. Xác định Frontend, Backend và pipeline có sẵn hay chưa.
4. Kiểm tra tài nguyên máy tính và trạng thái Kubernetes.
5. Đề xuất kiến trúc tích hợp phù hợp.
6. Nêu rõ các file cần thêm hoặc sửa.

Sau đó thực hiện theo từng giai đoạn:

Giai đoạn A: Khảo sát dự án và chốt kiến trúc.

Giai đoạn B: Xây dựng hoặc hoàn thiện Backend.

Giai đoạn C: Xây dựng hoặc hoàn thiện Frontend.

Giai đoạn D: Tích hợp Frontend với Backend.

Giai đoạn E: Docker hóa và chạy local.

Giai đoạn F: Tạo CI cho cả hai thành phần.

Giai đoạn G: Publish image lên GHCR.

Giai đoạn H: Tích hợp GitOps, Kubernetes và Argo CD.

Giai đoạn I: Kiểm thử end-to-end và rollback.

Giai đoạn J: Hoàn thiện tài liệu, ảnh minh chứng và kịch bản bảo vệ.

Với mỗi giai đoạn, hãy cung cấp mục tiêu, file cần sửa, nội dung hoàn chỉnh, lệnh chạy chính xác, kết quả dự kiến và checklist xác nhận.

Không xóa hoặc ghi đè file cũ khi chưa kiểm tra. Không reset Ubuntu hoặc xóa Docker volume. Không để lộ credentials. Không bỏ qua lỗi để chuyển sang giai đoạn tiếp theo.

## YÊU CẦU BẮT ĐẦU

Hãy bắt đầu ngay với Giai đoạn A: khảo sát dự án hiện tại và đề xuất phương án tích hợp Frontend + Backend vào pipeline GitOps CI/CD.

Chưa tự động cài đặt hàng loạt. Trước hết, hãy xác định những gì đã có, những gì còn thiếu và kế hoạch thay đổi cụ thể.

Mục tiêu cuối cùng là một sản phẩm web có Frontend và Backend thực sự hoạt động, được kiểm thử, đóng gói bằng Docker, triển khai bằng Kubernetes và tự động đồng bộ qua Argo CD dựa trên GitOps.