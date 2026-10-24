pipeline {
    agent any

    environment {
        // ==== EDIT THESE TWO LINES ====
        DOCKERHUB_USER = 'your-dockerhub-username'
        IMAGE_NAME     = 'library-book-tracker'
        // ==============================

        IMAGE          = "${DOCKERHUB_USER}/${IMAGE_NAME}"
        TAG            = "${BUILD_NUMBER}"
        // Jenkins credential (type: Username with password) holding your Docker Hub login.
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
    }

    stages {

        stage('Checkout') {
            steps {
                // Jenkins pulls the latest code from the configured GitHub repo
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                sh '''
                    node --version
                    npm ci
                    # Lint (code-quality gate)
                    npm run lint
                    # Automated tests (9 tests, self-contained)
                    npm test
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                      --build-arg GIT_SHA=$(git rev-parse --short HEAD) \
                      -t $IMAGE:$TAG \
                      -t $IMAGE:latest .
                '''
            }
        }

        stage('Push Image') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDS_PSW" | docker login -u "$DOCKERHUB_CREDS_USR" --password-stdin
                    docker push $IMAGE:$TAG
                    docker push $IMAGE:latest
                    docker logout
                '''
            }
        }

        stage('Deploy to Minikube') {
            steps {
                sh '''
                    # Apply the Kubernetes manifests
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml

                    # Point the deployment at the exact image this run just pushed
                    kubectl set image deployment/library-book-tracker \
                      library-book-tracker=$IMAGE:$TAG

                    # Wait for the rollout to finish
                    kubectl rollout status deployment/library-book-tracker --timeout=120s
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    echo "===== Pods ====="
                    kubectl get pods -l app=library-book-tracker -o wide
                    echo "===== Deployment ====="
                    kubectl get deployment library-book-tracker
                    echo "===== Service ====="
                    kubectl get service library-book-tracker-service
                '''
            }
        }
    }

    post {
        success {
            echo "Deployed ${IMAGE}:${TAG} to Minikube successfully."
        }
        failure {
            echo "Pipeline failed — check the stage logs above."
        }
    }
}
