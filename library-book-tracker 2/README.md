# Library Book Tracker — CI/CD Pipeline Report

**Author:** Aditya Agashe
**Course:** Cloud Computing and DevOps (CCA 2)

## 1. The Project

Library Book Tracker is a Node.js (Express) web application for managing books and
tracking their availability — view, add, search, issue, and return books, with live
statistics and a `/health` endpoint. Data is held in memory (no database), which keeps
the app simple so the focus stays on the delivery pipeline, not the application.

The assignment is **not** about app complexity — it is about automating delivery. This
project wraps the app in a fully automated CI/CD pipeline using **Jenkins**, **Docker**,
**Docker Hub**, and **Kubernetes on Minikube**, all running on an **AWS EC2** instance.

## 2. Repository Contents

```text
library-book-tracker/
├── Jenkinsfile                  # Declarative Jenkins pipeline (the CI/CD definition)
├── Dockerfile                   # Builds the app into a container image
├── k8s/
│   ├── deployment.yaml          # Kubernetes Deployment (2 replicas, health probes)
│   └── service.yaml             # Kubernetes Service (NodePort, exposes the app)
├── app.js                       # Express routes / application logic
├── server.js                    # Server entry point
├── public/index.html            # Frontend (HTML/CSS/JS)
├── test/app.test.js             # 9 automated tests (Node built-in test runner)
├── eslint.config.js             # Lint configuration
├── package.json / package-lock.json
└── README.md                    # This report
```

## 3. Pipeline Stages (what each does)

| Stage | What happens |
|---|---|
| **Checkout** | Jenkins pulls the latest code from GitHub (`checkout scm`). |
| **Build & Test** | `npm ci` installs dependencies; `npm run lint` checks code quality; `npm test` runs the 9 automated tests. If any fail, the pipeline stops. |
| **Docker Build** | Builds the image from the `Dockerfile`, tagged with the Jenkins build number and `latest`. |
| **Push Image** | Logs in to Docker Hub using credentials stored securely in Jenkins and pushes both tags. |
| **Deploy to Minikube** | Applies `k8s/deployment.yaml` and `k8s/service.yaml`, then `kubectl set image` points the Deployment at the exact image this run pushed, and waits for the rollout. |
| **Verify** | Prints pods, deployment, and service status so you can confirm the app is running. |

Pipeline flow:

```text
GitHub push → Jenkins Checkout → Build + Test → Docker Build → Push to Docker Hub → Deploy to Minikube → Verify
```

## 4. How Jenkins Was Set Up on AWS

A single **AWS EC2** instance (Ubuntu) hosts everything: Jenkins, Docker, Minikube, and
kubectl. Docker, Node.js, Minikube, and kubectl are installed on the instance; the
`jenkins` user is added to the `docker` group so the pipeline can build and push images.
A Jenkins **Pipeline job** is pointed at this GitHub repository and configured to use the
`Jenkinsfile` from the repo ("Pipeline script from SCM"). Docker Hub credentials are
stored in Jenkins as a *Username with password* credential with the ID `dockerhub-creds`
— they never appear in the code.

## 5. How the Image Is Pushed

The **Push Image** stage logs in to Docker Hub with the stored credentials and pushes
`<your-dockerhub-username>/library-book-tracker` with two tags: the build number (for a
unique, traceable version) and `latest`. The image is public, so Minikube can pull it
from the registry without extra secrets.

## 6. How It Is Deployed and Accessed

Kubernetes runs on **Minikube** on the same EC2 instance. The **Deployment** runs 2
replicas with readiness/liveness probes on `/health`. The **Service** is a `NodePort`
exposing the app. After deployment it is reached with:

```bash
minikube service library-book-tracker-service --url
```

## 7. Second Run (code change)

To demonstrate continuous deployment, a small source-code change is made (for example,
editing the heading text in `public/index.html` or a book in `app.js`), committed, and
pushed. Jenkins runs the pipeline again automatically, builds a new image with a new
build number, pushes it, and rolls it out to Minikube — showing the new version live.

## 8. Run / Test Locally

```bash
npm install
npm start        # http://localhost:3000
npm test         # 9 tests (self-contained, no server needed)
npm run lint
```

## 9. Docker (manual)

```bash
docker build -t library-book-tracker .
docker run -p 3000:3000 library-book-tracker
```
