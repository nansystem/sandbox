import { http, HttpResponse } from "msw";
import type { components } from "./generated/api";

type Pet = components["schemas"]["Pet"];

const pets: Pet[] = [
  { id: 1, name: "Pochi", species: "dog", age: 3 },
  { id: 2, name: "Tama", species: "cat", age: 5 },
  { id: 3, name: "Piyo", species: "bird", age: 1 },
];

export const handlers = [
  http.get("http://localhost:3000/pets", ({ request }) => {
    const url = new URL(request.url);
    const species = url.searchParams.get("species");
    const limitParam = url.searchParams.get("limit");

    let result = [...pets];

    if (species) {
      result = result.filter((p) => p.species === species);
    }
    if (limitParam) {
      const limit = Number(limitParam);
      if (Number.isNaN(limit) || limit < 0) {
        return HttpResponse.json(
          { code: 400, message: "Invalid limit parameter" },
          { status: 400 },
        );
      }
      result = result.slice(0, limit);
    }

    return HttpResponse.json(result);
  }),

  http.get("http://localhost:3000/pets/:petId", ({ params }) => {
    const petId = Number(params["petId"]);
    const pet = pets.find((p) => p.id === petId);

    if (!pet) {
      return HttpResponse.json(
        { code: 404, message: "Pet not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(pet);
  }),

  http.post("http://localhost:3000/pets", async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      species: string;
      age?: number;
    };

    if (!body.name || !body.species) {
      return HttpResponse.json(
        { code: 422, message: "name and species are required" },
        { status: 422 },
      );
    }

    const newPet: Pet = {
      id: pets.length + 1,
      name: body.name,
      species: body.species as Pet["species"],
      age: body.age,
    };

    return HttpResponse.json(newPet, { status: 201 });
  }),

  http.put("http://localhost:3000/pets/:petId", async ({ params, request }) => {
    const petId = Number(params["petId"]);
    const pet = pets.find((p) => p.id === petId);

    if (!pet) {
      return HttpResponse.json(
        { code: 404, message: "Pet not found" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      species?: string;
      age?: number;
    };

    const updated: Pet = {
      ...pet,
      ...body,
      species: (body.species as Pet["species"]) ?? pet.species,
    };

    return HttpResponse.json(updated);
  }),

  http.delete("http://localhost:3000/pets/:petId", ({ params }) => {
    const petId = Number(params["petId"]);
    const pet = pets.find((p) => p.id === petId);

    if (!pet) {
      return HttpResponse.json(
        { code: 404, message: "Pet not found" },
        { status: 404 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
