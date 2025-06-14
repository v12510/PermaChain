## Language

- [English](#english)
- [中文](#中文)

---

### English


# PermaChain
Blockchain-Based Permanent Information Storage System


## 1. Project Overview
### 1.1 Project Objective
To build a decentralized platform for permanent information storage that enables users to submit text and file attachments via cryptocurrency wallets. All data is permanently stored on blockchain while supporting efficient retrieval.

### 1.2 Core Features
Wallet Integration: Supports mainstream wallets like MetaMask
Data Submission: Text + file attachments submission
Blockchain Storage: Dual-chain storage on BNB Chain and Base Chain
Distributed Storage: Hybrid IPFS + Google Cloud Storage architecture
Advanced Search: Title, tag, full-text, and semantic search
Cross-chain Browsing: Seamless multi-chain data exploration

## 2. Technical Architecture
### 2.1 System Architecture
![image](https://github.com/user-attachments/assets/1d60071d-3685-410f-b5e5-f151bb7d90fc)

### 2.2 Technology Stack
Frontend
Component	Technology
Framework	React.js (Next.js)
UI Library	Tailwind CSS + Headless UI
Web3	ethers.js v6
File Upload	react-dropzone
State Management	Zustand
Smart Contracts
Component	Technology
Language	Solidity 0.8.x
Dev Framework	Hardhat
Testing	Chai + Mocha
Deployment	JavaScript
Backend Services
Component	Technology
Language	TypeScript (Node.js)
Framework	Express.js
IPFS	ipfs-http-client
Google Cloud	@google-cloud/storage
Database	PostgreSQL + pgvector
Infrastructure
Component	Technology
Containerization	Docker
Orchestration	Kubernetes
Monitoring	Prometheus + Grafana
Logging	ELK Stack

## 3. Core Functionality Implementation
### 3.1 Data Storage Workflow
![image](https://github.com/user-attachments/assets/40d00b81-94a7-421c-b82a-f46ecbe1529a)
### 3.2 Search Architecture
User Search Request
    │
    ▼
 Frontend API
    │
    ▼
 Search Service
    ├─▶ Keyword Search → PostgreSQL
    ├─▶ Tag Search → PostgreSQL
    └─▶ Semantic Search → pgvector
            │
            ▼
        Result Aggregation
            │
            ▼
        Return to Frontend



### 中文


# PermaChain
基于区块链的永久信息存储系统


## 1. 项目概述
### 1.1 项目目标
建立一个去中心化的信息永久保存平台，允许用户通过加密货币钱包提交文本信息和文件附件，所有数据通过区块链永久保存，并支持高效检索。
### 1.2 核心功能
钱包连接：支持MetaMask等主流加密货币钱包
信息提交：支持文本+文件附件组合提交
区块链存储：数据存储在BNB Chain和Base Chain双链
分布式存储：IPFS + Google云存储混合架构
高级搜索：标题、标签、全文检索（含向量搜索）
跨链浏览：支持多链数据无缝浏览

## 2. 技术架构
### 2.1 系统架构图
┌─────────────────────────────────────────────────┐
│                  前端应用                       │
│  ┌─────────────┐  ┌─────────────┐  ┌────────┐   │
│  │  钱包连接   │  │  信息提交   │  │ 搜索    │  │
│  └─────────────┘  └─────────────┘  └────────┘   │
└───────────────┬──────────────────────┬────────┘
                │                      │
┌───────────────▼──────┐  ┌────────────▼───────┐
│     智能合约          │  │    后端服务        │
│ (BNB Chain/Base链)   │  │ ┌───────────────┐  │
└───────────────┬──────┘  │ │ 文件上传服务  │ │
                │         │ └───────────────┘ │
                │         │ ┌───────────────┐ │
                │         │ │  索引服务     │ │
                │         │ └───────────────┘ │
                │         └─────────┬─────────┘
                │                   │
┌───────────────▼──────┐  ┌─────────▼─────────┐
│        IPFS         │  │   Google云存储     │
└─────────────────────┘  └─────────────────── ┘

### 2.2 技术栈
前端
组件	技术方案
框架	React.js (Next.js)
UI库	Tailwind CSS + Headless UI
Web3	ethers.js v6
文件上传	react-dropzone
状态管理	Zustand
智能合约
组件	技术方案
语言	Solidity 0.8.x
开发框架	Hardhat
测试	Chai + Mocha
部署脚本	JavaScript
后端服务
组件	技术方案
语言	TypeScript (Node.js)
框架	Express.js
IPFS	ipfs-http-client
Google云	@google-cloud/storage
数据库	PostgreSQL + pgvector
基础设施
组件	技术方案
容器化	Docker
编排	Kubernetes
监控	Prometheus + Grafana
日志	ELK Stack

## 3. 核心功能实现
### 3.1 数据存储流程
![image](https://github.com/user-attachments/assets/c4b93e81-2328-4ad5-b0d6-88512071277d)
### 3.2 搜索功能架构
用户搜索请求
    │
    ▼
 前端API
    │
    ▼
 搜索服务
    ├─▶ 关键词搜索 → PostgreSQL
    ├─▶ 标签搜索 → PostgreSQL
    └─▶ 语义搜索 → pgvector(向量搜索)
            │
            ▼
       结果聚合
            │
            ▼
       返回前端

