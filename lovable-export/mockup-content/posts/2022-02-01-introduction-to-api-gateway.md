---
title: "Introduction to API Gateway"
date: 2022-02-01 11:30:00 +0530
tags: [api-gateway, kong]
series: api-gateway-101
header:
  teaser: https://raw.githubusercontent.com/adisakshya/weblog/static-assets/introduction-to-api-gateway/meta/teaser.jpg
  image: https://raw.githubusercontent.com/adisakshya/weblog/static-assets/introduction-to-api-gateway/meta/api-gateway-banner.png
excerpt: Understanding what API Gateways are, how they differ from a reverse proxy & load balancer and their use in a microservices environment
comments: true
---

Let’s say we are building an application that uses the microservices architecture. These types of applications provide API delivering a specific use case. Additionally, the number of running service instances or the number of services in an application itself can change, which should be hidden from clients. 

So how do the clients of Microservices-based applications access the individual services? The client application would need to interact with multiple different services to get the required information for the user and any update in a service should be hidden from clients.

This is where the concept of API Gateway comes into the picture. It follows the literal meaning of a **“Gateway” - the place which you must go through to get to somewhere else**. 

The API Gateway acts as a single entry point to the available backend services in an application for all the clients. It can also implement security, e.g. verify that the client is authorized to perform the request. Just like a security guard standing in front of the gateway and verifying if you are allowed to go beyond the gateway.

In this [API Gateway 101](http://adisakshya.codes/weblog) series, we’ll understand what these gateways are all about and get our hands dirty by setting up an API Gateway in front of an application that uses the microservices architecture deployed on Kubernetes. But one step at a time.

## What is an API?

Firstly we need to understand what exactly an API is? 

Application Programming Interface (API) provides a blueprint that specifies how application services in a software system should interact with each other. It acts as a bridge between different services and abstracts away the underlying complexity to present it as a well-defined product.

---

Cool, now let’s get started and understand - 

- What is an API Gateway?
- What is the difference between API Gateway, Load Balancer and Reverse Proxy?
- What is Kong?
- What is the use of an API Gateway in a microservices environment?

## What is an API Gateway?

At the most basic level, an API follows a request-response cycle i.e., the API service accepts a remote request and returns a response. But this isn’t that simple, let’s think about various concerns when we host large-scale API -

- We want to protect our API services from overuse and abuse, so we should use an authentication service and rate-limiting etc.
- We want to understand how people use our APIs, so we’d like added analytics and monitoring tools.
- Over time we’ll add some new API services and retire others, but our clients will still want to find all our services in the same place.

The challenge is to provide the clients with a simple & dependable interface for enabling them to interact with our system and manage remote requests in a centralized manner.

> An API gateway is an API management tool that sits in front of the backend API services and acts as a single entry point for all clients wanting to consume the services.
> 

The gateway intercepts all the incoming remote requests and can apply a variety of necessary checks and functions.

![API Gateway Architecture](https://raw.githubusercontent.com/adisakshya/weblog/static-assets/introduction-to-api-gateway/api-gateway.png)


### API Gateway vs Load Balancer vs Reverse Proxy

At this point, an API gateway might sound pretty similar to a load balancer and reverse proxy. These applications sit between the clients and backend servers, accepting remote requests from the former and delivering responses from the latter. 

To understand the difference, let’s explore when and why they’re typically used -

#### Load Balancer

Load balancing helps prevent the overloading of individual systems & prevent failure due to the same. A load balancer offers the ability to distribute incoming remote requests across multiple backend services. 

![Load Balancer Architecture](https://raw.githubusercontent.com/adisakshya/weblog/static-assets/introduction-to-api-gateway/loadbalancer.png)

Say, we are running 5 instances of a backend service behind the load balancer. The incoming requests will be distributed between these 5 servers following the load balancing strategy like round-robin, least utilized etc. If any of these 5 servers fail due to any reason then the load balancer would distribute the incoming requests to the remaining operational backend services.

#### Reverse Proxy

A Reverse Proxy acts as a mediator between the client and one or more backend services.

It can rewrite the URLs, so the client will not know who is sitting behind the reverse proxy. Its responsibility is to forward the remote request to the appropriate backend service that can fulfil it.

![Reverse Proxy Architecture](https://raw.githubusercontent.com/adisakshya/weblog/static-assets/introduction-to-api-gateway/reverse-proxy.png)

A typical reverse proxy can be used for -

- **Load Balancing**: it offers the ability to distribute incoming requests across multiple backend servers.
- **Caching**: content is often kept in a place called proxy cache. So for recurring requests, it can answer autonomously in less time.
- **SSL Encryption**: it can be configured to decrypt all incoming requests and encrypt all outgoing responses.

#### API Gateway

We can think of the API Gateway as a superset of a Reverse Proxy.

The gateway hides the backend architecture from the clients. It addresses some common utilities like -

- Authentication and Authorization: It can control who can request what
    - Example - It offers the possibility to control the access to specific backend services based upon the plans that the API consumer have purchased.
- IP Whitelisting: It can grant the ability to use the API services only to specific IP addresses
- Rate Limiting, Throttling, and Quota: A limit can be set based on how many requests the backend servers can handle for a certain unit of time.
    - Looking at the commercial aspect, it offers the possibility to control the traffic that API consumers are using based on the plan they’ve purchased
- Logging, Tracing, Correlation: It can gather all the logs for each specific remote request.

**Differences at a glance -** 

| Function | Load Balancer | Reverse Proxy | API Gateway |
| --- | --- | --- | --- |
| Balance incoming requests | ✅ | ✅ | ✅ |
| URL Rewrite |  | ✅ | ✅ |
| Caching |  | ✅ | ✅ |
| Prevention from Attack |  |  | ✅ |
| Protocol Translation |  |  | ✅ |
| Authentication |  |  | ✅ |
| IP Whitelisting |  |  | ✅ |
| Rate Limiting, Quota |  |  | ✅ |
| Logging |  |  | ✅ |
| Tracing |  |  | ✅ |
| Health Checking |  |  | ✅ |
| Dynamic Config Updates |  |  | ✅ |

## What is Kong?

Kong Gateway is one of the most popular open-source API gateways. It securely manages the communication between clients & backend services via an API.

Kong sits in front of backend services and extends these APIs using [Plugins](https://konghq.com/plugins) to provide extra utilities like authentication, rate-limiting etc

A typical Kong API Gateway setup looks something like this -

![Kong API Gateway Architecture](https://raw.githubusercontent.com/adisakshya/weblog/static-assets/introduction-to-api-gateway/kong-api-gateway.png)

Once the architecture is deployed and running, every remote request to the backend services will hit kong first thus becoming the entry point for any API request.

If you want to deep dive into working of Kong then you can refer to this - [https://konghq.com/faqs/](https://konghq.com/faqs/)

## What is the use of an API Gateway in a microservices environment?

In a microservices architecture, each microservice exposes a set of endpoints with specific functionalities.

Client applications usually want to consume functionality from more than one microservice. If there is a direct Client‑to‑Microservice Communication, then the client application would need to handle multiple calls to the backend microservice endpoints. When the client application is linked with the internal endpoints then evolving the microservices would mean updating the client application too. But ideally updating internal APIs should have minimal impact on the client application.

This is where the API Gateway comes to the rescue, it encapsulates the backend services architecture and provides an API that can be customized for each client application.

## Next Steps

We’ll get our hands dirty in the next article where we’ll 

- Spin several microservices
- Setup a Kong API Gateway in front of the microservices
- Access the created services them using the gateway

See you there!
