import type { FastifyRequest } from "fastify";

function uploadFileController (request: FastifyRequest,){
    const data = request.body;
    console.log(data);
}

export {uploadFileController};