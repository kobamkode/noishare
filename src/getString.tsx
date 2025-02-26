import { HTTPException } from 'hono/http-exception';

export const getString = (formData: File | string | null) => {
        if (formData instanceof File) {
                throw new HTTPException(400);
        }

        if (typeof formData === null) {
                throw new HTTPException(400);
        }

        return formData;
};

