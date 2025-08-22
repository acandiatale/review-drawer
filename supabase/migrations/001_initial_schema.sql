-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, email)
);

-- Create roulettes table
CREATE TABLE IF NOT EXISTS roulettes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    selected_members JSONB NOT NULL, -- Array of selected member objects [{id, name, email, position}]
    total_participants INTEGER NOT NULL,
    executed_by VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roulette_id UUID NOT NULL REFERENCES roulettes(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);
CREATE INDEX idx_roulettes_team_id ON roulettes(team_id);
CREATE INDEX idx_roulettes_executed_at ON roulettes(executed_at DESC);
CREATE INDEX idx_invites_roulette_id ON invites(roulette_id);
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to teams table
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply update trigger to team_members table
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE teams IS '팀 정보를 저장하는 테이블';
COMMENT ON TABLE team_members IS '팀원 정보를 저장하는 테이블';
COMMENT ON TABLE roulettes IS '룰렛 실행 기록을 저장하는 테이블';
COMMENT ON TABLE invites IS '초대 코드 정보를 저장하는 테이블';

COMMENT ON COLUMN roulettes.selected_members IS '선정된 멤버 정보 (상단/하단 포인터 위치)';
COMMENT ON COLUMN invites.code IS '6자리 고유 초대 코드';
COMMENT ON COLUMN invites.expires_at IS '초대 코드 만료 시간 (생성 후 24시간)';