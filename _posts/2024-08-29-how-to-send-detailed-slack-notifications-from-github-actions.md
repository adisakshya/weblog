---
title: "How to Send Detailed Slack Notifications from GitHub Actions?"
date: 2024-08-29 12:00:00 +0530
author: "Adisakshya Chauhan"
tags: [github-actions, github, slack, slack-integration, ci-cd, automation, tech-tutorial, continuous-integration]
header:
  teaser: "https://hackernoon.imgix.net/images/Za3QtTvBFDSxRQKeQkur9mQWXt83-hu13yrd.png?auto=format%2Ccompress&w=3840"
  image: "https://hackernoon.imgix.net/images/Za3QtTvBFDSxRQKeQkur9mQWXt83-hu13yrd.png?auto=format%2Ccompress&w=3840"
excerpt: "Set up detailed Slack notifications for GitHub Actions, including commit metadata, workflow information and build duration."
original_url: "https://hackernoon.com/how-to-send-detailed-slack-notifications-from-github-actions"
original_publication: "HackerNoon"
original_publication_date: "2024-08-29"
original_category: "AI and ML"
---

![Featured image for How to Send Detailed Slack Notifications from GitHub Actions](https://hackernoon.imgix.net/images/Za3QtTvBFDSxRQKeQkur9mQWXt83-hu13yrd.png?auto=format%2Ccompress&w=3840)


> **Technical note (November 2026):** This is my original August 2024 tutorial, preserved for reference. Some workflow commands and action versions below are outdated. In particular, the `::set-output` workflow command is deprecated; new workflows should write step outputs to `$GITHUB_OUTPUT`. The current Slack Action also uses a newer version and different webhook inputs. For a new implementation, consult [GitHub’s workflow-command documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands) and [Slack’s current incoming-webhook guide](https://docs.slack.dev/tools/slack-github-action/sending-data-slack-incoming-webhook/).

## Introduction

GitHub Actions is a powerful tool that allows you to automate workflows directly from your GitHub repository. One common use case is sending notifications to a Slack channel whenever a certain event occurs, such as a successful or failed build.

This blog post will walk you through the steps to set up Slack notifications in GitHub Actions, format the message with detailed information about the workflow run, and dynamically include details such as commit hashes, authors, and build duration.

## Step-by-Step Guide to Set Up Slack Notifications Using Incoming Webhook

### 1. Setting Up a Slack Incoming Webhook

Before you can send notifications to Slack, you need to set up an Incoming Webhook:

1. **Create a Slack App**: Go to the [Slack API: Applications](https://api.slack.com/apps) page, and create a new app for your workspace.
2. **Enable Incoming Webhooks**: Once the app is created, go to the "*Incoming Webhooks*" section, and click "*Activate Incoming Webhooks*".
3. **Create a Webhook URL**: Click on "*Add New Webhook to Workspace*", select the channel you want to post to and click "*Allow*". This will generate a Webhook URL.
4. **Store Your Webhook URL in GitHub Secrets**: Copy the Webhook URL, and add it to your GitHub repository as a secret:
   * Go to your GitHub repository.
   * Click on `Settings` > `Secrets and variables` > `Actions`.
   * Click `New repository secret` and add a new secret named `SLACK_WEBHOOK_URL` with your Webhook URL as the value.

### 2. Creating Your GitHub Actions Workflow

Next, you'll create a GitHub Actions workflow file to send notifications to Slack. Here's a step-by-step breakdown of the YAML configuration:

#### 2.1 Basic Setup

Create a new file in your repository under `.github/workflows/slack_notification.yml`.

```yaml
name: Slack Notification
run-name: Pushing notification on Slack channel

on: [push]
```

* `name`: This defines the name of the workflow.
* `run-name`: This is the name that will be displayed in the GitHub Actions interface when this workflow runs.
* `on`: Specifies the event that triggers this workflow. In this case, it runs on every push.

#### 2.2 Define the Jobs

Next, define the job that will send the Slack notification:

```yaml
jobs:
  Notify-Slack-Channel:
    runs-on: ubuntu-latest
```

* `jobs`: A workflow consists of one or more jobs that run sequentially or in parallel.
* `Notify-Slack-Channel`: This is a custom name for our job.
* `runs-on`: Specifies the type of runner to execute the job. Here, `ubuntu-latest` is used.

#### 2.3 Calculate Build Start Time

To dynamically calculate the build duration, we first capture the build start time:

```yaml
steps:
  - name: Calculate build start time
    id: build_start_time
    run: echo "BUILD_START_TIME=$(date +%s)" >> $GITHUB_ENV
```

* `steps`: A job contains a series of steps.
* `name`: Describes what this step does.
* `id`: Used to reference this step's outputs later.
* `run`: Runs command-line scripts. Here, we use `date +%s` to get the current Unix timestamp and save it to an environment variable (`$GITHUB_ENV`).

#### 2.4 Checkout Code

To ensure that the workflow has access to the repository's code, use the checkout action:

```yaml
  - name: Checkout code
    uses: actions/checkout@v2
```

* `uses`: Indicates the use of an action defined in another repository. `actions/checkout@v2` checks out the repository code.

#### 2.5 Calculate Build Duration

Calculate the time taken for the job to complete:

```yaml
  - name: Calculate build duration
    id: calculate_duration
    run: |
      end_time=$(date +%s)
      duration=$((end_time - $BUILD_START_TIME))
      echo "duration=$duration" >> $GITHUB_ENV
      echo "::set-output name=duration::$duration"
```

* `end_time=$(date +%s)`: Captures the current time at the end of the build.
* `duration`: Computes the difference between the start and end times to get the build duration.
* `$GITHUB_ENV`: Outputs the duration to the environment variable for use in later steps.

#### 2.6 Get Short Commit Hash

To shorten the commit hash to just the first 7 characters:

```yaml
  - name: Get short commit hash
    id: short_commit
    run: echo "SHORT_SHA=${GITHUB_SHA:0:7}" >> $GITHUB_ENV
```

* `SHORT_SHA=${GITHUB_SHA:0:7}`: Extracts the first 7 characters of the commit hash.

#### 2.7 Send Slack Notification

Finally, use the `slackapi/slack-github-action` to send the formatted Slack message:

```yaml
  - name: Send custom JSON data to Slack workflow
    id: slack
    uses: slackapi/slack-github-action@v1.26.0
    with:
      payload: |
        {
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*:white_check_mark: Succeeded GitHub Actions*"
              }
            },
            {
              "type": "section",
              "fields": [
                {
                  "type": "mrkdwn",
                  "text": "*Repo*\n<https://github.com/${{ github.repository }}|${{ github.repository }}>"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Commit*\n<${{ github.event.head_commit.url }}|${{ env.SHORT_SHA }}>"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Author*\n${{ github.event.head_commit.author.name }}"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Job*\n`${{ github.job }}`"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Event Name*\n`${{ github.event_name }}`"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Workflow*\n`${{ github.workflow }}`"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Build Logs*\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Logs>"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Took*\n`${{ steps.calculate_duration.outputs.duration }} sec`"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Message*\n${{ github.event.head_commit.message }}"
                }
              ]
            }
          ]
        }
    env:
      SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

* `with.payload`: The JSON-formatted payload that defines the structure and content of the Slack message.
* `mrkdwn`: Slack's markup syntax to format text, which allows bolding with `*text*`, links with `<url|text>`, and more.
* `env`: Environment variables used within the workflow.

This is how the Slack notification looks like -

![Screenshot of the Slack notification generated by GitHub Actions, showing repository, commit, author, job, workflow, build logs, duration, and commit message](https://hackernoon.imgix.net/images/Za3QtTvBFDSxRQKeQkur9mQWXt83-t503ymb.png?auto=format%2Ccompress&w=1920)

## Key Features

* **Dynamic Content:** The payload dynamically pulls in relevant GitHub Actions data like repository name, commit hash, author, job name, event name, workflow name, build logs link, build duration, and commit message.
* **Formatted Slack Message:** The Slack message is formatted using Slack's Block Kit to make it readable and structured.
* **Error Handling:** Ensures that sensitive information (like Slack webhook URL) is stored securely using GitHub Secrets.

## Conclusion

By following the steps above, you can automate Slack notifications from GitHub Actions to keep your team informed about the status of your workflows. The notification is dynamically populated with key information about the run, short commit hashes, and build durations, providing a comprehensive overview directly in Slack. Now, you're all set to keep your team updated with every push!

Feel free to share this post with anyone who might find it useful.

Happy automating! 🚀

---

*Originally published on [HackerNoon](https://hackernoon.com/how-to-send-detailed-slack-notifications-from-github-actions) on August 29, 2024.*
