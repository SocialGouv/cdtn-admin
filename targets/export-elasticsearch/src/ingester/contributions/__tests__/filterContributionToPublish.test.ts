import { filterContributionDocumentsToPublish } from "../fetchContributionDocumentsToPublish";

describe("filterContributionDocumentsToPublish", () => {
  it("should send the list of contributions which have been updated after last export", () => {
    const result = filterContributionDocumentsToPublish([
      {
        cdtn_id: "388f8d7860",
        //@ts-ignore
        export: {
          createdAt: "2024-06-03T08:10:03.697249+00:00",
        },
        //@ts-ignore
        contribution: {
          id: "d61a3e21-9bf1-4199-b9d7-944c2382750c",
          updatedAt: "2024-03-25T17:25:33.002376+00:00",
          statuses: [
            {
              status: "PUBLISHED",
              createdAt: "2024-03-27T14:26:28.387898+00:00",
            },
          ],
        },
      },
    ]);
    expect(result?.length).toBe(0);
  });
  it("should send the list of contributions which have been updated after last export2", () => {
    const result = filterContributionDocumentsToPublish([
      {
        cdtn_id: "388f8d7860",
        //@ts-ignore
        export: {
          createdAt: "2024-06-03T08:10:03.697249+00:00",
        },
        //@ts-ignore
        contribution: {
          id: "d61a3e21-9bf1-4199-b9d7-944c2382750c",
          updatedAt: "2024-03-25T17:25:33.002376+00:00",
          statuses: [
            {
              status: "PUBLISHED",
              createdAt: "2024-06-27T14:26:28.387898+00:00",
            },
          ],
        },
      },
    ]);
    expect(result?.length).toBe(1);
  });
});
