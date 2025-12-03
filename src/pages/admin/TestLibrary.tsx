import { useState } from "react";
import { Link } from "react-router-dom";
import { useTestStore } from "@/store/testStore";
import { TestCard } from "@/components/common/TestCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";

export default function TestLibrary() {
  const { tests, deleteTest } = useTestStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase()) ||
      test.description.toLowerCase().includes(search.toLowerCase()) ||
      test.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your assessment tests
          </p>
        </div>
        <Button asChild>
          <Link to="/tests/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Test Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onDelete={() => deleteTest(test.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No tests found</h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first test"}
          </p>
          {!search && statusFilter === "all" && (
            <Button asChild>
              <Link to="/tests/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Test
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
