import hashlib
import math


class EmbeddingProvider:
    dimensions = 32

    def embed(self, text: str) -> list[float]:
        raise NotImplementedError


class MockEmbeddingProvider(EmbeddingProvider):
    def embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        for token in text.lower().replace("/", " ").replace(",", " ").split():
            digest = hashlib.sha256(token.encode()).digest()
            index = digest[0] % self.dimensions
            vector[index] += 1 + digest[1] / 255
        norm = math.sqrt(sum(v * v for v in vector)) or 1.0
        return [round(v / norm, 6) for v in vector]


def cosine(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b, strict=False))


def get_embedding_provider() -> EmbeddingProvider:
    return MockEmbeddingProvider()
