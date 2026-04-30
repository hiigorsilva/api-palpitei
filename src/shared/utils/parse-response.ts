import type { HttpResponse } from "../types/http";

export const parseResponse = ({ data }: HttpResponse) => {
	return {
		data,
	};
};
