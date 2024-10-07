import amqp from "amqplib"
import { MiarError } from "./miar-error";

export class MiarRabbitMQ {
    url: string;
    connection: amqp.Connection | undefined;
    channel: amqp.Channel | undefined;

    constructor(url: string) {
        this.url = url;
    }

    async connectAsync() {
        this.connection = await amqp.connect(this.url);
        this.channel = await this.connection.createChannel();
    }

    async disconnectAsync() {
        await this.channel?.close();
        await this.connection?.close();
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
            console.log("Error - RabbitMQ - An error occured when sending message to queue. " +
                `(queue_name: ${qName}) (message: ${JSON.stringify(msg)})`);
            return false;
        }
    }
}