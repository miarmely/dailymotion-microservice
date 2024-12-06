import amqp from "amqplib"
import miarLog from "./miar-log";

export class MiarRabbitMQ {
    rabbitMqUrl: string;
    connection: amqp.Connection | undefined;
    channel: amqp.Channel | undefined;

    constructor(rabbitMqUrl: string) {
        this.rabbitMqUrl = rabbitMqUrl;
    }

    async connectAsync() {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl);
            this.channel = await this.connection.createChannel();

            return true;
        } catch (err: any) {
            miarLog.log("Error",
                "RabbitMQ - An error occured when connecting to RabbitMQ server.",
                {
                    status_code: 500,
                    error: JSON.stringify(err)
                });

            return false;
        }
    }

    async disconnectAsync() {
        try {
            await this.channel?.close();
            await this.connection?.close();
            return true;
        } catch (err: any) {
            miarLog.log("Error",
                "RabbitMQ - An error occured when connecting to RabbitMQ server.",
                {
                    status_code: 500,
                    error: JSON.stringify(err)
                });
            return false;
        }
    }
    /**
     * @param qName Queue name.
     */
    async sendMessageToQueueAsync(qName: string, msg: any) {
        try {
            await this.connectAsync();
            await this.channel?.assertQueue(qName, { durable: true });

            // send message
            const buffer = Buffer.from(JSON.stringify(msg));
            const isSended = this.channel?.sendToQueue(qName, buffer);
            if (!isSended) throw new Error();

            await this.disconnectAsync();
            return true;

        } catch (err: any) {
            miarLog.log("Error",
                "RabbitMQ - An error occured when sending message to queue.",
                {
                    status_code: 500,
                    error: JSON.stringify(err),
                    queue_name: qName,
                    queue_message: JSON.stringify(msg)
                })
            return false;
        }
    }
}